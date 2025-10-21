"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { KPCKoordinat } from "../../../../../services/types";
import { useRouter } from "next/navigation";
import UseGuardInstance from "../../../../../services/instance";
import { Button } from "@/components/ui/button";

// cache ringan agar buka modal yg sama tidak refetch
const modalCache = new Map<string, any>();

interface PopupDetailI {
  data: KPCKoordinat & {
    __jarak_kckcu_km?: number | null;
    type_penyelenggara?: string;
    jam_kerja_senin_kamis?: string;
    jam_kerja_jumat?: string;
    jam_kerja_sabtu?: string;
  };
}

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="grid grid-cols-[200px_1fr] gap-4 py-1">
    <span className="text-slate-300">{label}</span>
    <span className="font-semibold text-white break-words">{value ?? "-"}</span>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-7 mb-3 text-sm font-semibold text-slate-200">
    {children}
  </div>
);

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white">
    {children}
  </span>
);

const fmtNum = (v: any, suffix = "") => {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return `${n}${suffix}`;
};
const fmtKm = (v: any) => {
  if (v === null || v === undefined || v === "") return "-";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return `${n.toFixed(2)} km`;
};

// === paksa ukuran container modal dari dalam komponen
function useEnforceBigModal(rootId = "__popupdetail_root") {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    // cari ancestor yang kemungkinan container modal
    const selectors = [
      '[role="dialog"]',
      ".modal",
      ".DialogContent",
      ".ModalContent",
      ".fixed.z-50", // beberapa lib
      '[data-state="open"]',
    ];
    let node: HTMLElement | null = root.parentElement;
    let hit: HTMLElement | null = null;
    for (let i = 0; i < 8 && node; i++) {
      if (selectors.some((sel) => node!.matches(sel))) {
        hit = node;
        break;
      }
      node = node.parentElement;
    }
    // kalau ketemu, override ukurannya
    if (hit) {
      hit.style.maxWidth = "min(1440px, 98vw)";
      hit.style.width = "min(1440px, 98vw)";
      hit.style.padding = hit.style.padding || "0"; // hindari padding sempit
      hit.classList.remove(
        "max-w-sm",
        "max-w-md",
        "max-w-lg",
        "max-w-xl",
        "max-w-2xl",
        "max-w-3xl"
      );
    }
  }, [rootId]);
}

const PopupDetail: FC<PopupDetailI> = ({ data }) => {
  useEnforceBigModal(); // ⬅️ aktifkan "pemaksa" lebar modal

  const router = useRouter();
  const request = UseGuardInstance(router);

  const type = (data as any)?.type_penyelenggara || "lpu";
  const idKey = useMemo(
    () =>
      String(
        (data as any)?.id_kpc ||
          (data as any)?.id ||
          (data as any)?.nomor_dirian ||
          ""
      ),
    [data]
  );
  const cacheKey = `${type}:${idKey}`;

  const [detail, setDetail] = useState<any>(data || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!idKey) return;
      setLoading(true);
      try {
        if (modalCache.has(cacheKey)) {
          if (alive)
            setDetail({ ...(data || {}), ...(modalCache.get(cacheKey) || {}) });
          return;
        }
        const params: Record<string, string> = {
          type_penyelenggara: type,
          id_kpc: idKey,
        };
        if ((data as any)?.id_rekonsiliasi)
          params.id_rekonsiliasi = String((data as any).id_rekonsiliasi);
        const qs = "?" + new URLSearchParams(params).toString();

        const res = await request.get(`/monitoring-detail${qs}`);
        const more = res?.data?.data ?? {};
        modalCache.set(cacheKey, more);
        if (alive) setDetail({ ...(data || {}), ...(more || {}) });
      } catch {
        if (alive) setDetail({ ...(data || {}) });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [cacheKey]);

  const d: any = detail || {};
  const title =
    type === "mitra"
      ? "Mitra LPU"
      : type === "penyelenggara"
      ? "Penyelenggara POS"
      : "Kantor Pos LPU";

  const nama = d?.nama || d?.__nama || "Tanpa Nama";
  const idKpc = d?.id_kpc || d?.id || "-";
  const kodeDirian = d?.nomor_dirian || "-";
  const regional = d?.nama_regional || "-";
  const kprk = d?.nama_kprk || "-";
  const jenis = d?.jenis_kantor || "-";
  const alamat = d?.alamat || "-";
  const kel = d?.nama_kelurahan || "-";
  const kec = d?.nama_kecamatan || "-";
  const kab = d?.nama_kabupaten || "-";
  const prov = d?.nama_provinsi || d?.nama_provisi || "-";

  const lat = d?.koordinat_latitude ?? (data as any)?.__lat ?? null;
  const lng = d?.koordinat_longitude ?? (data as any)?.__lng ?? null;

  const jarakDB = d?.jarak_ke_kprk;
  const jarakComputed =
    typeof d?.__jarak_kckcu_km === "number"
      ? d.__jarak_kckcu_km
      : typeof (data as any)?.__jarak_kckcu_km === "number"
      ? (data as any).__jarak_kckcu_km
      : null;

  const photos: string[] =
    (
      d?.foto ||
      d?.pencatatan_kantor_files ||
      d?.pencatatan_files ||
      d?.files ||
      []
    )
      ?.map((f: any) => f?.url || f?.file || f?.path)
      ?.filter(Boolean) ?? [];

  const copyKoordinat = async () => {
    if (lat == null || lng == null) return;
    try {
      await navigator.clipboard.writeText(`${lat}, ${lng}`);
    } catch {}
  };

  return (
    <div
      id="__popupdetail_root"
      className="
        p-6 md:p-8
        w-[96vw] md:w-[94vw] lg:w-[1100px] xl:w-[1280px] 2xl:w-[1440px]
        max-w-[98vw]
        max-h-[88vh] overflow-auto
        bg-slate-900 text-white
        rounded-2xl border border-slate-700 shadow-2xl
      "
      style={{ width: "min(1440px, 98vw)" }}
    >
      {/* Header */}
      <div className="flex items-start gap-5">
        <img src="/poslogo.png" className="w-10 h-10" alt="" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-200">{title}</div>
          <div className="mt-1 text-3xl font-bold leading-8 tracking-tight">
            {nama}
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            <Badge>ID KPC: {idKpc}</Badge>
            <Badge>Kode Dirian: {kodeDirian}</Badge>
            {jenis && <Badge>{jenis}</Badge>}
            {regional && <Badge>Regional: {regional}</Badge>}
            {kprk && <Badge>KPRK: {kprk}</Badge>}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-4 text-xs text-slate-300">Memuat detail…</div>
      )}

      {/* Lokasi & Koordinat */}
      <SectionTitle>Lokasi</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-x-12">
        <div className="space-y-2">
          <Row label="Alamat" value={alamat} />
          <Row label="Desa/Kelurahan" value={kel} />
          <Row label="Kecamatan" value={kec} />
          <Row label="Kabupaten/Kota" value={kab} />
          <Row label="Provinsi" value={prov} />
        </div>
        <div className="space-y-2">
          <Row
            label="Koordinat"
            value={lat != null && lng != null ? `${lat}, ${lng}` : "-"}
          />
          <Row
            label="Jarak ke KC/KCU"
            value={
              jarakDB != null && jarakDB !== ""
                ? fmtKm(jarakDB)
                : jarakComputed != null
                ? fmtKm(jarakComputed)
                : "-"
            }
          />
          <Row label="Regional" value={regional} />
          <Row label="KPRK" value={kprk} />
          <Row label="Jenis Kantor" value={jenis} />
          <Row label="Tipe Kantor" value={d?.tipe_kantor} />
        </div>
      </div>

      {/* Kontak & Operasional */}
      <SectionTitle>Kontak & Operasional</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-x-12">
        <div className="space-y-2">
          <Row label="Nomor Telepon" value={d?.nomor_telpon} />
          <Row label="Nomor Fax" value={d?.nomor_fax} />
          <Row
            label="Frekuensi Antar ke Alamat"
            value={fmtNum(d?.frekuensi_antar_ke_alamat)}
          />
          <Row
            label="Frekuensi Antar dari KPRK"
            value={fmtNum(d?.frekuensi_antar_ke_dari_kprk)}
          />
          <Row
            label="Jumlah Tenaga Kontrak"
            value={fmtNum(d?.jumlah_tenaga_kontrak)}
          />
        </div>
        <div className="space-y-2">
          <Row
            label="Jam Layanan (Senin–Kamis)"
            value={d?.jam_kerja_senin_kamis}
          />
          <Row label="Jam Layanan (Jumat)" value={d?.jam_kerja_jumat} />
          <Row label="Jam Layanan (Sabtu)" value={d?.jam_kerja_sabtu} />
        </div>
      </div>

      {/* Kondisi & Lingkungan */}
      <SectionTitle>Kondisi & Lingkungan</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-x-12">
        <div className="space-y-2">
          <Row label="Kondisi Gedung" value={d?.kondisi_gedung} />
          <Row
            label="Fasilitas Publik (Dalam)"
            value={d?.fasilitas_publik_dalam}
          />
          <Row
            label="Fasilitas Publik (Halaman)"
            value={d?.fasilitas_publik_halaman}
          />
        </div>
        <div className="space-y-2">
          <Row label="Lingkungan Kantor" value={d?.lingkungan_kantor} />
          <Row
            label="Lingkungan Sekitar Kantor"
            value={d?.lingkungan_sekitar_kantor}
          />
        </div>
      </div>

      {/* Sinkronisasi & Audit */}
      <SectionTitle>Sinkronisasi & Audit</SectionTitle>
      <div className="grid lg:grid-cols-2 gap-x-12">
        <div className="space-y-2">
          <Row label="Tgl Sinkronisasi" value={d?.tgl_sinkronisasi} />
          <Row label="Tgl Update" value={d?.tgl_update} />
        </div>
        <div className="space-y-2">
          <Row label="ID User" value={d?.id_user} />
          <Row label="ID File" value={d?.id_file} />
        </div>
      </div>

      {/* Foto */}
      <SectionTitle>Foto Lokasi</SectionTitle>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((src, i) => (
            <a
              key={i}
              href={src}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <img
                src={src}
                alt={`foto-${i}`}
                className="w-full h-56 object-cover rounded-xl border border-slate-700"
              />
            </a>
          ))}
        </div>
      ) : (
        <div className="text-sm text-slate-300">Belum ada foto.</div>
      )}

      {/* Footer actions */}
      <div className="mt-8 flex flex-wrap gap-2 justify-end">
        {lat != null && lng != null && (
          <>
            <Button
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
              onClick={copyKoordinat}
              title="Salin koordinat ke clipboard"
            >
              Salin Koordinat
            </Button>
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button className="bg-white text-slate-900 hover:bg-white/90">
                Buka di Google Maps
              </Button>
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default PopupDetail;
