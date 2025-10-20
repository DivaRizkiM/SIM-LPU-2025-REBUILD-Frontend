import { FC } from "react";
import { KPCKoordinat } from "../../../../../services/types";

interface PopupDetailI {
  data: KPCKoordinat & {
    __jarak_kckcu_km?: number | null;
    type_penyelenggara?: string;
    // kemungkinan field jam kerja dari BE (untuk KCP)
    jam_kerja_senin_kamis?: string;
    jam_kerja_jumat?: string;
    jam_kerja_sabtu?: string;
  };
}

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex flex-col min-w-0">
    <span className="font-semibold">{label}</span>
    <span className="truncate">{value ?? "-"}</span>
  </div>
);

const PopupDetail: FC<PopupDetailI> = ({ data }) => {
  return (
    <div className="p-4 max-h-[60vh] overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Row label="Nama Lokasi" value={(data as any).__nama || data.nama} />
        <Row
          label="ID Kantor"
          value={(data as any).id_kpc || (data as any).id}
        />
        <Row label="Nama KPRK/KC/KCU" value={(data as any).nama_kprk} />
        <Row label="Alamat" value={(data as any).alamat} />
        <Row
          label="Koordinat"
          value={`${(data as any).koordinat_latitude ?? (data as any).__lat}, ${
            (data as any).koordinat_longitude ?? (data as any).__lng
          }`}
        />
        <Row label="Jenis Kantor" value={(data as any).jenis_kantor} />
        <Row label="Provinsi ID" value={(data as any).id_provinsi} />
        <Row label="Kab/Kota ID" value={(data as any).id_kabupaten_kota} />
        <Row label="Kecamatan ID" value={(data as any).id_kecamatan} />
        <Row label="Kelurahan ID" value={(data as any).id_kelurahan} />
        <Row
          label="Jarak ke KC/KCU"
          value={
            typeof (data as any).__jarak_kckcu_km === "number"
              ? `${(data as any).__jarak_kckcu_km.toFixed(2)} km`
              : "Tidak tersedia"
          }
        />
      </div>

      {/* Jam Layanan (kalau ada di payload BE) */}
      <div className="mt-4 space-y-2">
        <div className="font-semibold">Jam Layanan</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Row
            label="Senin–Kamis"
            value={(data as any).jam_kerja_senin_kamis}
          />
          <Row label="Jumat" value={(data as any).jam_kerja_jumat} />
          <Row label="Sabtu" value={(data as any).jam_kerja_sabtu} />
        </div>
      </div>
    </div>
  );
};

export default PopupDetail;
