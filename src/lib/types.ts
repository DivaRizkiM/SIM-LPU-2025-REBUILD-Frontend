import { LucideIcon } from "lucide-react"
import { ModuleName } from "../../store/state"

export interface LinkI {
    title: string
    label?: string
    icon: LucideIcon
    variant: "default" | "ghost"
    url?: string
    module_name?: string
    child?: {
      title: string
      label?: string
      variant: "default" | "ghost"
      url: string
      module_name: ModuleName
    }[]
}

export interface BiayaAtribusiDetailI {
  id_biaya_atribusi_detail: string,
  kode_rekening: number,
  nama_rekening: string,
  tahun_anggaran: string,
  periode: string,
  keterangan: string,
  url_lampiran: any,
  pelaporan: string,
  verifikasi: string,
  catatan_pemeriksa: string,
  nama_kcu: string,
  jumlah_kpc_lpu: number,
  jumlah_kpc_lpk: number
  rumus_alokasi_kcu: string
  rumus_biaya_kcp: string
  alokasi_kcu: string
  biaya_kcp: string 
  rute?: string
  bobot_kiriman?: string
  lampiran?: string
}
export interface BiayaRutinDetailI {
  nama_kcp: string
  kategori_biaya: string
  catatan_pemeriksa: string
  id_verifikasi_biaya_rutin_detail: string
  keterangan: string
  kode_rekening: number
  lampiran: string
  url_lampiran: string
  nama_rekening: string
  pelaporan: string
  periode: string
  tahun: string | number
  verifikasi: string
  npp: string
  proporsi: string
  biaya_per_npp: string
  nama_file?: string
  ltk?: string
  hasil_perhitungan_fase_1?: string
  hasil_perhitungan_fase_2?: string
  hasil_perhitungan_fase_3?: string
  rumus_fase_1?: string
  rumus_fase_2?: string
  rumus_fase_3?: string
  biaya_per_kcp?:string
}
export interface VerifikasiProduksiDetailI {
  jenis_layanan: string;
  id_produksi_detail: string;
  produk_keterangan: string;
  aktivitas: string;
  kode_rekening: string;
  nama_rekening: string;
  tahun_anggaran: number;
  nama_bulan: string;
  keterangan: string;
  url_lampiran: string;
  pelaporan: string;
  verifikasi: string;
  catatan_pemeriksa: string;
  periode: string;
}
export interface PaginationI {
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  total_data: number;
}

interface Threshold {
  color: string;
  from: number;
  to: number;
}

export interface GaugeChartProps {
  chartType: string;
  title: string;
  value: number;
  min: number;
  max: number;
  thresholds: Threshold[];
}

export interface DonutChartProps {
  chartType: string;
  title: string;
  total: number;
  data: {
    category: string;
    total: number | string;
    value: number;
    color: string;
  }[];
}

export interface BarChartProps {
  chartType: string;
  title: string;
  yAxisLabel: string;
  xAxisLabel: string;
  data: {
    category: string;
    value: number;
    color: string;
  }[];
}

export interface PieChartProps {
  chartType: string;
  title: string;
  total: number;
  data: {
    category: string;
    total: number | string;
    value: number;
    color: string;
  }[];
}
interface LogInfo {
  id: number;
  komponen: string;
  tanggal: string;
  ip_address: string;
  platform_request: string;
  total_records: number;
  successful_records: number;
  available_records: number;
  proses: string;
  persentase: string;
}

interface RekeningData {
  [key: string]: any; // Mengizinkan properti dengan nama apa pun selain 'size'
  size: string;
}

export interface DetailSyncLog {
  status: string;
  log_info: LogInfo;
  data: RekeningData[];
}