"use client";

import { FC, useMemo, useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  Circle,
  LayerGroup,
  Polyline,
  Tooltip,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { context } from "../../../../../store";
import PopupDetail from "./PopupDetail";
import { KPCKoordinat } from "../../../../../services/types";
import UseGuardInstance from "../../../../../services/instance";
import { useRouter } from "next/navigation";

// ====================== Konstanta
const IND_BOUNDS = { minLat: -11.0, maxLat: 6.0, minLng: 95.0, maxLng: 141.0 };
const indonesiaCenter: L.LatLngExpression = [-2.548926, 118.014863];
const TOP_OFFSET_PX = 168;

// ====================== Util koordinat
const toFloat = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || s === "0" || s === "0.0" || s === "0,0") return null;
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const isValidLat = (lat: number) => lat >= -90 && lat <= 90;
const isValidLng = (lng: number) => lng >= -180 && lng <= 180;
const inIndonesia = (lat: number, lng: number) =>
  lat >= IND_BOUNDS.minLat &&
  lat <= IND_BOUNDS.maxLat &&
  lng >= IND_BOUNDS.minLng &&
  lng <= IND_BOUNDS.maxLng;

const normalizePoint = (rawLat: unknown, rawLng: unknown) => {
  const lat1 = toFloat(rawLat),
    lng1 = toFloat(rawLng);
  if (lat1 === null || lng1 === null) return null;
  if (isValidLat(lat1) && isValidLng(lng1)) {
    if (inIndonesia(lat1, lng1))
      return { lat: lat1, lng: lng1, swapped: false };
    if (isValidLat(lng1) && isValidLng(lat1) && inIndonesia(lng1, lat1))
      return { lat: lng1, lng: lat1, swapped: true };
  }
  if (isValidLat(lng1) && isValidLng(lat1) && inIndonesia(lng1, lat1))
    return { lat: lng1, lng: lat1, swapped: true };
  return null;
};

// ====================== Icon marker (oranye default, biru mitra)
const makePointerHTML = (variant: "default" | "mitra" = "default") => {
  const color = variant === "mitra" ? "#2563eb" : "#ff7a00";
  return `
    <div style="position:relative;width:30px;height:42px;transform:translate(-15px,-42px);">
      <div style="width:26px;height:26px;border-radius:50%;background:${color};
        box-shadow:0 0 0 2px #fff;display:flex;align-items:center;justify-content:center;margin:0 auto;">
        <img src="/poslogo.png" alt="pos" style="width:16px;height:16px;" />
      </div>
      <div style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);
        width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;
        border-top:14px solid ${color};"></div>
    </div>`;
};
const makePosIcon = (variant: "default" | "mitra" = "default") =>
  L.divIcon({
    className: "pos-pointer",
    html: makePointerHTML(variant),
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  });

// ====================== Haversine
const haversineKm = (a: number, b: number, c: number, d: number) => {
  const R = 6371,
    toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(c - a),
    dLon = toRad(d - b);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
};

// ====================== Row helper utk popup mini
const RowMini: FC<{ label: string; value?: any }> = ({ label, value }) => (
  <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
    <span className="text-slate-600">{label}</span>
    <span className="font-semibold break-words">{value ?? "-"}</span>
  </div>
);

// ====================== Popup mini (lengkap seperti figma)
const PopupMini: FC<{
  row: any;
  onDetail: (payload: any) => void;
  api: any; // Axios instance (UseGuardInstance)
}> = ({ row, onDetail, api }) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const params: Record<string, string> = {
          type_penyelenggara: row?.__type || "lpu",
        };
        if (row?.id_kpc || row?.id) params.id_kpc = String(row?.id_kpc || row?.id);
        if (row?.id_rekonsiliasi) params.id_rekonsiliasi = String(row.id_rekonsiliasi);

        const qs = "?" + new URLSearchParams(params).toString();
        const r = await api.get(`/monitoring-detail${qs}`);
        const data = r?.data?.data ?? {};
        if (!alive) return;
        setDetail(data);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Gagal memuat detail");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // depend on id/type agar fetch ulang tepat
  }, [row?.id_kpc, row?.id, row?.__type]);

  const d: any = detail || {};
  const namaKantor =
    d?.__nama || d?.nama || row?.__nama || row?.nama || "Tanpa Nama";
  const kodeDirian = d?.nomor_dirian || d?.id_kpc || d?.id || row?.id_kpc || row?.id || "-";
  const regional = d?.nama_regional || row?.nama_regional || "-";
  const kprk = d?.nama_kprk || row?.nama_kprk || "-";
  const jenis = d?.jenis_kantor || row?.jenis_kantor || "-";
  const alamat = d?.alamat || row?.alamat || "-";
  const nama_prov = d?.nama_provinsi || d?.nama_provisi || row?.nama_provinsi || "-";
  const nama_kab = d?.nama_kabupaten || row?.nama_kabupaten || "-";
  const nama_kec = d?.nama_kecamatan || row?.nama_kecamatan || "-";
  const nama_kel = d?.nama_kelurahan || row?.nama_kelurahan || "-";

  const rawFiles = d?.foto || d?.pencatatan_kantor_files || d?.files || [];
  const photos: string[] = (Array.isArray(rawFiles) ? rawFiles : [])
    .map((f: any) => f?.url || f?.file || f?.path || "")
    .filter(Boolean) as string[];

  return (
    <div className="text-slate-900 w-[360px]">
      <div className="font-bold mb-2">Kantor Pos LPU</div>

      {loading ? (
        <div className="text-xs text-slate-600">Memuat detail…</div>
      ) : err ? (
        <div className="text-xs text-red-600">{err}</div>
      ) : (
        <>
          <div className="space-y-1.5">
            <RowMini label="Nama Kantor Pos" value={namaKantor} />
            <RowMini label="Kode Dirian" value={kodeDirian} />
            <RowMini label="Regional" value={regional} />
            <RowMini label="KPRK" value={kprk} />
            <RowMini label="Jenis" value={jenis} />
            <RowMini label="Alamat" value={alamat} />
            <RowMini label="Desa/Kelurahan" value={nama_kel} />
            <RowMini label="Kecamatan" value={nama_kec} />
            <RowMini label="Kabupaten/Kota" value={nama_kab} />
            <RowMini label="Provinsi" value={nama_prov} />
          </div>

          {photos.length > 0 && (
            <>
              <div className="mt-3 text-slate-600 text-sm">Photo</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {photos.slice(0, 4).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`foto-${i}`}
                    className="w-full h-28 object-cover rounded"
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      <div className="flex justify-between items-center mt-3">
        <a
          href={`https://www.google.com/maps?q=${row?.__lat},${row?.__lng}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline text-slate-600"
        >
          Zoom to
        </a>

        {/* TIGA TITIK: buka modal detail lengkap */}
        <button
          type="button"
          onClick={() => onDetail({ ...(detail || {}), ...row })}
          className="text-xl leading-none px-2 select-none cursor-pointer"
          aria-label="Detail"
          title="Detail"
        >
          …
        </button>
      </div>
    </div>
  );
};

// ====================== Props
interface MapsI {
  dataSource: Array<KPCKoordinat>;
  isLoading: boolean;
  currentType?: string; // lpu | lpk | mitra | penyelenggara
  distanceLineData?: any;
  onClearDistance?: () => void;
}

// ====================== Komponen utama
const Maps: FC<MapsI> = ({ dataSource, isLoading, currentType, distanceLineData, onClearDistance }) => {
  const router = useRouter();
  const api = UseGuardInstance(router);
  const ctx = context();
  const mapRef = useRef<any>(null);

  // UI state
  const [base, setBase] = useState<"osm" | "imagery" | "topo">("osm");
  const [showMarkers, setShowMarkers] = useState(true);
  const [showRegional, setShowRegional] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);

  // GeoJSON + error
  const [regionalGeo, setRegionalGeo] = useState<any>(null);
  const [adminGeo, setAdminGeo] = useState<any>(null);
  const [regionalError, setRegionalError] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Load GeoJSON
  useEffect(() => {
    (async () => {
      try {
        setRegionalError(null);
        const r = await fetch("/geo/batas_regional.geojson");
        if (r.ok) setRegionalGeo(await r.json());
        else setRegionalError("Belum ada file /geo/batas_regional.geojson");
      } catch {
        setRegionalError("Gagal memuat /geo/batas_regional.geojson");
      }

      try {
        setAdminError(null);
        const a = await fetch("/geo/batas_admin.geojson");
        if (a.ok) {
          const j = await a.json();
          if (j?.type === "Topology")
            setAdminError("File batas_admin TopoJSON. Konversi ke GeoJSON.");
          else setAdminGeo(j);
        } else setAdminError("Belum ada file /geo/batas_admin.geojson");
      } catch {
        setAdminError("Gagal memuat /geo/batas_admin.geojson");
      }
    })();
  }, []);

  // Auto-zoom ke garis jarak
  useEffect(() => {
    if (distanceLineData?.origin && distanceLineData?.destination && mapRef.current) {
      const map = mapRef.current;
      
      const originPos: L.LatLngExpression = [
        distanceLineData.origin.latitude, 
        distanceLineData.origin.longitude
      ];
      const destPos: L.LatLngExpression = [
        distanceLineData.destination.latitude, 
        distanceLineData.destination.longitude
      ];
      
      const bounds = L.latLngBounds([originPos, destPos]);
      setTimeout(() => {
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
      }, 100);
    }
  }, [distanceLineData]);

  // Normalisasi titik
  const points = useMemo(() => {
    const out: any[] = [];
    for (let i = 0; i < (dataSource ?? []).length; i++) {
      const d: any = (dataSource as any[])[i];
      const latRaw =
        d?.koordinat_latitude ?? d?.latitude ?? d?.lat ?? d?.koordinat_lat;
      const lngRaw =
        d?.koordinat_longitude ?? d?.longitude ?? d?.long ?? d?.koordinat_lng;
      const norm = normalizePoint(latRaw, lngRaw);
      if (!norm) continue;

      const key = d?.id_kpc ?? d?.id ?? `${norm.lat},${norm.lng},${i}`;
      const nama =
        d?.nama ??
        d?.nama_kpc ??
        d?.nama_kantor ??
        d?.nama_mitra ??
        "Tanpa Nama";
      const type = (d?.sumber as string) || (currentType as string) || "lpu";

      const kLat =
        toFloat(d?.kprk_latitude ?? d?.lat_kprk ?? d?.kprk_lat ?? null) ?? null;
      const kLng =
        toFloat(d?.kprk_longitude ?? d?.lng_kprk ?? d?.kprk_lng ?? null) ??
        null;
      const jarak =
        kLat != null && kLng != null
          ? haversineKm(norm.lat, norm.lng, kLat, kLng)
          : null;

      out.push({
        ...d,
        __lat: norm.lat,
        __lng: norm.lng,
        __key: key,
        __nama: nama,
        __type: type,
        __jarak_kckcu_km: jarak,
      });
    }
    return out;
  }, [dataSource, currentType]);

  // Modal detail lengkap
  const openDetailModal = (payload: any) => {
    ctx.dispatch({
      isModal: {
        type: "modal",
        component: (
          <PopupDetail
            data={{
              ...(payload || {}),
              type_penyelenggara: payload?.__type || currentType || "lpu",
            }}
          />
        ),
      },
    });
  };

  const countLabel =
    (currentType === "mitra" && "Total Mitra LPU") ||
    (currentType === "penyelenggara" && "Total Penyelenggara") ||
    "Total LPU/LPK";

  const tileInfo = {
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attr: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    },
    imagery: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attr: "Tiles &copy; Esri — multiple sources",
    },
    topo: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
      attr: "Tiles &copy; Esri",
    },
  } as const;

  return (
    <div className="relative">
      <style>{`
        .leaflet-top.leaflet-left  { margin-top: ${TOP_OFFSET_PX}px; }
        .leaflet-top.leaflet-right { margin-top: ${TOP_OFFSET_PX}px; }
      `}</style>

      {/* Panel kanan: Style Map + Layers + radius counter */}
      <div
        className="absolute right-3 z-[500] space-y-2"
        style={{ top: TOP_OFFSET_PX }}
      >
        <div className="rounded-xl bg-white/95 shadow p-2 w-60 text-slate-900">
          <div className="text-xs font-semibold mb-1">Style Map</div>
          <select
            className="w-full text-sm border rounded px-2 py-1 bg-white text-slate-900"
            value={base}
            onChange={(e) => setBase(e.target.value as any)}
          >
            <option value="imagery">Imagery (Esri)</option>
            <option value="osm">OpenStreetMap</option>
            <option value="topo">Topographic (Esri)</option>
          </select>
        </div>

        <div className="rounded-xl bg-white/95 shadow p-2 w-60 text-slate-900">
          <div className="text-xs font-semibold mb-1">Layers</div>

          <label className="flex items-center gap-2 text-sm py-1">
            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(e) => setShowMarkers(e.target.checked)}
            />
            <span>Sebaran LPU/LPK/Mitra</span>
          </label>

          <label className="flex items-center gap-2 text-sm py-1">
            <input
              type="checkbox"
              disabled={!regionalGeo}
              checked={showRegional && !!regionalGeo}
              onChange={(e) => setShowRegional(e.target.checked)}
            />
            <span>Batas Regional POS</span>
          </label>

          <label className="flex items-center gap-2 text-sm py-1">
            <input
              type="checkbox"
              disabled={!adminGeo}
              checked={showAdmin && !!adminGeo}
              onChange={(e) => setShowAdmin(e.target.checked)}
            />
            <span>Batas Administrasi</span>
          </label>

          <label className="flex items-center gap-2 text-sm py-1">
            <input
              type="checkbox"
              checked={showCoverage}
              onChange={(e) => setShowCoverage(e.target.checked)}
            />
            <span>Cakupan Layanan (radius 10 km)</span>
          </label>

          {distanceLineData && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 text-xs text-slate-600 bg-red-50 px-2 py-1 rounded">
                📍 Garis jarak ditampilkan
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearDistance}
                className="h-7 px-2 text-xs"
              >
                Hapus
              </Button>
            </div>
          )}

          <div className="mt-2 flex items-center gap-3 bg-white/95 rounded-xl px-3 py-2 shadow">
            <img src="/poslogo.png" alt="pos" className="w-7 h-7" />
            <div className="leading-tight">
              <div className="text-xs text-slate-700">{countLabel}</div>
              <div className="text-lg font-semibold">
                {isLoading ? "…" : points.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        ref={mapRef}
        center={indonesiaCenter}
        zoom={5}
        style={{ height: "100vh", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer url={tileInfo[base].url} attribution={tileInfo[base].attr} />

        {/* Batas Regional */}
        {showRegional && regionalGeo && (
          <GeoJSON
            data={regionalGeo as any}
            style={() => ({ color: "#ff7a00", weight: 1.2, fillOpacity: 0.04 })}
          />
        )}

        {/* Batas Administrasi */}
        {showAdmin && adminGeo && (
          <GeoJSON
            data={adminGeo as any}
            style={() => ({
              color: "#1e3a8a",
              weight: 2.2,
              dashArray: "6 4",
              fillOpacity: 0,
            })}
          />
        )}

        {/* Marker cluster */}
        {showMarkers && (
          <MarkerClusterGroup chunkedLoading>
            {!isLoading &&
              points.map((row: any) => (
                <Marker
                  key={row.__key}
                  position={[row.__lat, row.__lng]}
                  icon={makePosIcon(
                    row.__type === "mitra" ? "mitra" : "default"
                  )}
                >
                  <Popup maxWidth={380}>
                    <PopupMini row={row} api={api} onDetail={openDetailModal} />
                  </Popup>
                </Marker>
              ))}
          </MarkerClusterGroup>
        )}

        {/* Cakupan layanan 10 km */}
        {showCoverage && (
          <LayerGroup>
            {points.map((p: any) => (
              <Circle
                key={`cov-${p.__key}`}
                center={[p.__lat, p.__lng]}
                radius={10_000}
                pathOptions={{
                  color: p.__type === "mitra" ? "#1e3a8a" : "#ff7a00",
                  fillOpacity: 0.08,
                }}
              />
            ))}
          </LayerGroup>
        )}

        {/* Garis jarak antara dua kantor */}
        {distanceLineData?.origin && distanceLineData?.destination && (
          <Polyline
            positions={[
              [distanceLineData.origin.latitude, distanceLineData.origin.longitude],
              [distanceLineData.destination.latitude, distanceLineData.destination.longitude],
            ]}
            pathOptions={{
              color: "#dc2626",
              weight: 5,
              opacity: 1,
              lineCap: "round",
              lineJoin: "round",
              dashArray: "8, 6",
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -10]}
              className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold border-0"
            >
              {distanceLineData.distance_km?.toFixed(2)} km
            </Tooltip>
          </Polyline>
        )}
      </MapContainer>
    </div>
  );
};

export default Maps;
