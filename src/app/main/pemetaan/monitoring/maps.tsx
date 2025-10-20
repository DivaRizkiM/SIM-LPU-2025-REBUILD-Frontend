"use client";

import { FC, useMemo, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  Circle,
  LayerGroup,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { context } from "../../../../../store";
import PopupDetail from "./PopupDetail";
import { KPCKoordinat } from "../../../../../services/types";

const IND_BOUNDS = { minLat: -11.0, maxLat: 6.0, minLng: 95.0, maxLng: 141.0 };
const indonesiaCenter: L.LatLngExpression = [-2.548926, 118.014863];

// dorong kontrol Leaflet agar tidak ketutup filter bar
const TOP_OFFSET_PX = 168;

interface MapsI {
  dataSource: Array<KPCKoordinat>;
  isLoading: boolean;
  currentType?: string; // lpu | lpk | mitra | penyelenggara
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

// Marker POS (oranye default, biru untuk mitra)
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

const Maps: FC<MapsI> = ({ dataSource, isLoading, currentType }) => {
  const ctx = context();

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

  // Load geojson—tampilkan info kalau file nggak ada
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

  const onClickDetail = (row: any) => {
    ctx.dispatch({
      isModal: {
        title: "Detail Lokasi",
        type: "modal",
        component: (
          <PopupDetail
            data={{
              ...row,
              type_penyelenggara: row?.__type || currentType || "lpu",
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

      {/* Panel kanan: Base Map + Layers + Counter di bawah Layers */}
      <div
        className="absolute right-3 z-[500] space-y-2"
        style={{ top: TOP_OFFSET_PX }}
      >
        <div className="rounded-xl bg-white/95 shadow p-2 w-60 text-slate-900">
          <div className="text-xs font-semibold mb-1">Base Map</div>
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
          {!regionalGeo && (
            <div className="pl-6 text-xs text-red-600">
              {regionalError ?? "Data tidak tersedia"}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm py-1">
            <input
              type="checkbox"
              disabled={!adminGeo}
              checked={showAdmin && !!adminGeo}
              onChange={(e) => setShowAdmin(e.target.checked)}
            />
            <span>Batas Administrasi</span>
          </label>
          {!adminGeo && (
            <div className="pl-6 text-xs text-red-600">
              {adminError ?? "Data tidak tersedia"}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm py-1">
            <input
              type="checkbox"
              checked={showCoverage}
              onChange={(e) => setShowCoverage(e.target.checked)}
            />
            <span>Cakupan Layanan (radius 10 km)</span>
          </label>

          {/* === Counter ditempatkan persis DI BAWAH panel Layers === */}
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

      <MapContainer
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
            style={() => ({
              color: "#ff7a00",
              weight: 1.2,
              fillOpacity: 0.04,
            })}
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
                  <Popup maxWidth={360}>
                    <div className="text-slate-900">
                      <strong>{row.__nama}</strong>
                      <br />
                      Provinsi ID: {row.id_provinsi ?? "-"}
                      <br />
                      <small>Tipe: {row.__type || "lpu"}</small>
                      {typeof row.__jarak_kckcu_km === "number" && (
                        <>
                          <br />
                          <small>
                            Jarak ke KC/KCU: {row.__jarak_kckcu_km.toFixed(2)}{" "}
                            km
                          </small>
                        </>
                      )}
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
      </MapContainer>
    </div>
  );
};

export default Maps;
