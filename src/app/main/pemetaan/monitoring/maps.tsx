import { FC, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { context } from "../../../../../store";
import PopupDetail from "./PopupDetail";
import { KPCKoordinat } from "../../../../../services/types";

// Batas kasar Indonesia untuk validasi cepat
const IND_BOUNDS = { minLat: -11.0, maxLat: 6.0, minLng: 95.0, maxLng: 141.0 };
const indonesiaCenter: L.LatLngExpression = [-2.548926, 118.014863];

interface MapsI {
  dataSource: Array<KPCKoordinat>;
  isLoading: boolean;
}

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

/**
 * Normalisasi satu titik:
 * - parse angka
 * - deteksi bila lat/lng kebalik (pakai heuristik batas Indonesia)
 * - kembalikan null kalau tetap tidak valid
 */
const normalizePoint = (rawLat: unknown, rawLng: unknown) => {
  const lat1 = toFloat(rawLat);
  const lng1 = toFloat(rawLng);

  // Tidak ada angka
  if (lat1 === null || lng1 === null) return null;

  // Kalau keduanya valid secara global
  if (isValidLat(lat1) && isValidLng(lng1)) {
    // case 1: sudah benar dan ada di Indonesia
    if (inIndonesia(lat1, lng1)) {
      return { lat: lat1, lng: lng1, swapped: false };
    }
    // case 2: coba swap
    if (isValidLat(lng1) && isValidLng(lat1) && inIndonesia(lng1, lat1)) {
      return { lat: lng1, lng: lat1, swapped: true };
    }
  }

  // Kasus data mentah sering salah taruh: long=-6.xxx, lat=106.xxx (kebalik)
  // Coba paksa swap jika memenuhi batas Indonesia
  if (isValidLat(lng1) && isValidLng(lat1) && inIndonesia(lng1, lat1)) {
    return { lat: lng1, lng: lat1, swapped: true };
  }

  // Masih tidak masuk akal → buang
  return null;
};

const getIcon = () =>
  L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const Maps: FC<MapsI> = ({ dataSource, isLoading }) => {
  const ctx = context();

  const points = useMemo(() => {
    const total = dataSource?.length ?? 0;
    let parsed = 0;
    let swapped = 0;
    const out: Array<any> = [];

    for (let i = 0; i < (dataSource ?? []).length; i++) {
      const d: any = (dataSource as any[])[i];

      // Ambil field yang dikirim BE
      const rawLat = d?.koordinat_latitude ?? d?.latitude;
      const rawLng = d?.koordinat_longitude ?? d?.longitude;

      const norm = normalizePoint(rawLat, rawLng);
      if (!norm) continue;

      parsed++;
      if (norm.swapped) swapped++;

      const key = d?.id_kpc ?? d?.id ?? `${norm.lat},${norm.lng},${i}`;
      const nama = d?.nama ?? d?.nama_kpc ?? d?.nama_kantor ?? "Tanpa Nama";

      out.push({
        ...d,
        __lat: norm.lat,
        __lng: norm.lng,
        __key: key,
        __nama: nama,
      });
    }

    // Ringkasan di console untuk debug cepat
    // (Akan terlihat berapa yang terswap & terpasang)
    // eslint-disable-next-line no-console
    console.log(
      "[MAPS] total:",
      total,
      "parsed:",
      parsed,
      "swapped:",
      swapped,
      "rendered:",
      out.length
    );

    return out;
  }, [dataSource]);

  const onClickDetail = (data: KPCKoordinat) => {
    ctx.dispatch({
      isModal: {
        title: "Detail KCP",
        type: "modal",
        component: <PopupDetail data={data} />,
      },
    });
  };

  // Optional: fokus ke Indonesia saat mount
  useEffect(() => {
    // nothing
  }, []);

  return (
    <MapContainer
      center={indonesiaCenter}
      zoom={5}
      style={{ height: "100vh", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MarkerClusterGroup chunkedLoading>
        {!isLoading &&
          points.map((kpc: any) => (
            <Marker
              key={kpc.__key}
              position={[kpc.__lat, kpc.__lng]}
              icon={getIcon()}
            >
              <Popup>
                <div>
                  <strong>{kpc.__nama}</strong>
                  <br />
                  Provinsi ID: {kpc.id_provinsi ?? "-"}
                </div>
                <div className="flex justify-center mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onClickDetail(kpc)}
                  >
                    Lihat Detail
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
};

export default Maps;
