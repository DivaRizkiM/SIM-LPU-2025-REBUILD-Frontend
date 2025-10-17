"use client";

import { FC, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { context } from "../../../../../store";
import PopupDetail from "./PopupDetail";
import { KPCKoordinat } from "../../../../../services/types";

const IND_BOUNDS = { minLat: -11.0, maxLat: 6.0, minLng: 95.0, maxLng: 141.0 };
const indonesiaCenter: L.LatLngExpression = [-2.548926, 118.014863];

interface MapsI {
  dataSource: Array<KPCKoordinat>;
  isLoading: boolean;
  /** lpu | lpk | mitra | penyelenggara */
  currentType?: string;
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

const normalizePoint = (rawLat: unknown, rawLng: unknown) => {
  const lat1 = toFloat(rawLat);
  const lng1 = toFloat(rawLng);
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

// default (biru)
const baseIconUrl =
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";
// hijau untuk mitra
const greenIconUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png";
// merah (opsional) untuk penyelenggara lain
const redIconUrl =
  "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";

const iconCache: Record<string, L.Icon> = {};

const getIcon = (type?: string) => {
  const key = (type || "default").toLowerCase();
  if (iconCache[key]) return iconCache[key];

  let iconUrl = baseIconUrl;
  if (key === "mitra") iconUrl = greenIconUrl;
  else if (key === "penyelenggara") iconUrl = redIconUrl;

  iconCache[key] = L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  return iconCache[key];
};

const Maps: FC<MapsI> = ({ dataSource, isLoading, currentType }) => {
  const ctx = context();

  const points = useMemo(() => {
    const total = dataSource?.length ?? 0;
    let parsed = 0;
    let swapped = 0;
    const out: Array<any> = [];

    for (let i = 0; i < (dataSource ?? []).length; i++) {
      const d: any = (dataSource as any[])[i];

      // Koordinat dari BE (nama kolom diseragamkan di API)
      const rawLat =
        d?.koordinat_latitude ?? d?.latitude ?? d?.lat ?? d?.koordinat_lat;
      const rawLng =
        d?.koordinat_longitude ?? d?.longitude ?? d?.long ?? d?.koordinat_lng;

      const norm = normalizePoint(rawLat, rawLng);
      if (!norm) continue;

      parsed++;
      if (norm.swapped) swapped++;

      const key = d?.id_kpc ?? d?.id ?? `${norm.lat},${norm.lng},${i}`;
      const nama =
        d?.nama ??
        d?.nama_kpc ??
        d?.nama_kantor ??
        d?.nama_mitra ??
        "Tanpa Nama";

      // sumber/tipe—BE untuk mitra mengirim 'sumber' = 'mitra'
      const type = (d?.sumber as string) || (currentType as string) || "lpu"; // default KPC

      out.push({
        ...d,
        __lat: norm.lat,
        __lng: norm.lng,
        __key: key,
        __nama: nama,
        __type: type,
      });
    }

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
  }, [dataSource, currentType]);

  const onClickDetail = (data: KPCKoordinat | any) => {
    // Selipkan type_penyelenggara agar PopupDetail bisa hit endpoint show dengan benar
    const payload = {
      ...data,
      type_penyelenggara: data?.__type || currentType || "lpu",
    };
    ctx.dispatch({
      isModal: {
        title: "Detail Lokasi",
        type: "modal",
        component: <PopupDetail data={payload} />,
      },
    });
  };

  useEffect(() => {
    // no-op
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
          points.map((row: any) => (
            <Marker
              key={row.__key}
              position={[row.__lat, row.__lng]}
              icon={getIcon(row.__type)}
            >
              <Popup>
                <div>
                  <strong>{row.__nama}</strong>
                  <br />
                  Provinsi ID: {row.id_provinsi ?? "-"}
                  <br />
                  <small>Tipe: {row.__type || "lpu"}</small>
                </div>
                <div className="flex justify-center mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onClickDetail(row)}
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
