export enum Status {
    ENABLE = "0",
    DISABLE = "1"
}
export enum MethodAPI {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}
interface roleI {
  id: number;
  nama: string;
}
export interface Admin {
  id: number;
  // name: string;
  username: string;
  role: roleI
  // email: string;
  // roles: string[];
  // status: Status;
  // otp_code: string;
  // last_iat: number;
  // created_by: Admin;
  // updated_by: Admin;
  // created_at: Date;
  // updated_at: Date;
  // deleted_at: Date;
}

export type ErrorObj<T extends object> = {
  [key in keyof T]: string;
}

export interface ResponseAPI<T = any> {
  total_data?: number;
  grand_total?: string;
  blob: any;
  offset(offset: any): unknown;
  errors?: T extends object ? ErrorObj<T> : any;
  code: number,
  message: string,
  data: T,
  timestamp: string,
  version: string
}

export interface IRow<T> {
  row: T;
}

export interface IFormLogin {
  username: string,
  password_hash: string,
}
export interface IFormProvinsi {
  nama: string
}
export interface IFormVerifikasiBiayaAtribusi {
  id_biaya_atribusi_detail: string | number
  verifikasi: string
  catatan_pemeriksa: string
  isVerifikasiSesuai?: "0" | "1" | ""
}
export interface IFormRutinVerifikasi {
  id_verifikasi_biaya_rutin_detail: string | number
  verifikasi: string
  catatan_pemeriksa?: string
  isVerifikasiSesuai?: "0" | "1" | ""
}
export interface IFormVerifikasiProduksi {
  id_produksi_detail: string | number
  verifikasi: string
  catatan_pemeriksa?: string
  isVerifikasiSesuai?: "0" | "1" | ""
}
export interface IFormNppVerifikasi {
  id_npp: string | number
  verifikasi: string
  catatan_pemeriksa?: string
  isVerifikasiSesuai?: "0" | "1" | ""
}
export interface IDetailKpc {
  id_regional: string,
  id_kprk: string,
  nomor_dirian: string,
  nama: string,
  jenis_kantor: string,
  alamat: string,
  koordinat_longitude: string,
  koordinat_latitude: string 
  nomor_telpon: string,
  nomor_fax: string,
  id_provinsi: string,
  id_kabupaten_kota: string,
  id_kecamatan: string,
  id_kelurahan: string,
  tipe_kantor: string,
  jam_kerja_senin_kamis: string,
  jam_kerja_jumat: string,
  jam_kerja_sabtu: string,
  frekuensi_antar_ke_alamat: string,
  frekuensi_antar_ke_dari_kprk: string,
  jumlah_tenaga_kontrak: string,
  kondisi_gedung: string,
  fasilitas_publik_dalam: string,
  fasilitas_publik_halaman: string,
  lingkungan_kantor: string,
  lingkungan_sekitar_kantor: string,
  tgl_sinkronisasi: string,
  id_user: number,
  tgl_update: string,
  id_file: any,
  qr_code: any
}

export interface IkertasKerjaLaporan  {
  id_kprk: number,
  nama_kpc?: string
  pendapatan?: string
  nama_kprk: string,
  hasil_pelaporan_biaya: string,
  hasil_verifikasi_biaya: string,
  hasil_pelaporan_pendapatan: string,
  hasil_verifikasi_pendapatan: string
  deviasi_biaya: number,
  deviasi_produksi: number,
  deviasi_akhir: number
}
export interface ILaporanVerifikasiPendapatan  {
  nama_regional: string,
  nama_kprk: string,
  nama_kpc: string,
  nomor_dirian: string,
  total_lpu: string,
  total_lpk: string,
  total_lbf: number,
  jumlah_pendapatan: number,
  kategori_produksi: {
      "LAYANAN POS KOMERSIL": string,
      "LAYANAN POS UNIVERSAL": string,
      "LAYANAN TRANSAKSI KEUANGAN BERBASIS FEE": string,
  }
}
export interface KPCKoordinat {
  id_kpc: string;
  id: number;
  id_regional: number;
  id_kprk: number;
  nomor_dirian: string;
  nama: string;
  jenis_kantor: string;
  alamat: string;
  koordinat_longitude: string;
  koordinat_latitude: string;
  nomor_telpon: string;
  nomor_fax: string;
  id_provinsi: string;
  id_kabupaten_kota: string;
  id_kecamatan: string;
  id_kelurahan: string;
  tipe_kantor: string;
  jam_kerja_senin_kamis: string;
  jam_kerja_jumat: string;
  jam_kerja_sabtu: string;
  frekuensi_antar_ke_alamat: string;
  frekuensi_antar_ke_dari_kprk: string;
  jumlah_tenaga_kontrak: string | null;
  kondisi_gedung: string;
  fasilitas_publik_dalam: string;
  fasilitas_publik_halaman: string;
  lingkungan_kantor: string;
  lingkungan_sekitar_kantor: string;
  tgl_sinkronisasi: string;
  id_user: number | null;
  tgl_update: string;
  id_file: number | null;
  nama_regional: string;
  nama_kprk: string;
}
export interface LaporanBiayaI {
  nama_regional: string
  nama_kprk:string
  nama_kpc:string
  nomor_dirian:string
  total_biaya_pegawai:string
  total_biaya_operasi:string
  total_biaya_pemeliharaan:string
  total_biaya_administrasi:string
  total_biaya_penyusutan: number,
  jumlah_biaya: number,
  kategori_biaya: {
      "BIAYA PEGAWAI":string
      "BIAYA ADMINISTRASI":string
      "BIAYA OPERASI":string
      "BIAYA PEMELIHARAAN":string
  }
}
export interface RealisasiDanaI {
  nomor_dirian: string,
  nama_kpc: string,
  verifikasi_incoming: number,
  verifikasi_outgoing: number,
  verifikasi_sisa_layanan: number,
  jumlah: number,
  biaya: number,
  selisih: number
}
export interface DeviasiDanaI {
  nomor_dirian: string,
  nama_kpc: string,
  sum_alokasi_dana_lpu: number,
  realisasi: number,
  deviasi: number
}
export interface ProfilBoLpuI {
  id: number;
  id_kpc: string;
  kode_dirian: string;
  tahun: number;
  triwulan: string;
  biaya_pegawai: string;
  biaya_operasi: string;
  biaya_pemeliharaan: string;
  biaya_administrasi: string;
  biaya_penyusutan: string;
  alokasi_dana_lpu: string;
  tgl_sinkronisasi: string;
  nama_regional: string;
  nama_kprk: string;
  nama_kpc: string;
}
export interface CakupanWilayahI {
  id: number;
  id_penyelenggara: number;
  id_jenis_kantor: number;
  id_kelurahan: string;
  id_kantor: string;
  nama_kantor: string;
  alamat: string;
  longitude: string;
  latitude: string;
  nama_penyelenggara: string;
  nama_kelurahan: string;
  nama_jenis_kantor: string;
  nama_kecamatan: string;
  nama_kabupaten: string;
  nama_provinsi: string;
  JNT: string;
  SICEPAT: string;
}
export interface KabKotaI {
  id: string
  number: number
  kode: string
  nama: string
  id_provinsi: number
  nama_provinsi: string
}
export interface KelurahanI {
  id: string
  number: number
  kode: string
  nama: string
  nama_provinsi: string
  id_provinsi: number
  nama_kabupaten: string
  id_kabupaten_kota: number
  nama_kecamatan: string
  id_kecamatan: number
}
export interface ProvinsiI {
  id: string
  number: number
  kode_provinsi: string
  nama: string
}
export interface KecamatanI {
  id: string
  number: number
  kode: string
  nama: string
  nama_provinsi: string
  nama_kabupaten_kota: string
  id_provinsi: number
  id_kabupaten_kota: number
}
interface Petugas {
  nama_petugas: string;
}
export interface MonitoringKantorExistingI {
  tanggal: string;
  petugas_list: Petugas[];
  kode_pos: string;
  kantor_lpu: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  aspek_operasional: number;
  aspek_sarana: number;
  aspek_wilayah: number;
  aspek_keuangan: number;
  nilai_akhir: number;
  kesimpulan: string;
}
export interface NppI {
  id: number;
  kode_rekening: number;
  nama_rekening: string;
  bulan: string;
  tahun: string;
  nama_file: string;
  pelaporan: string;
  verifikasi: string;
  catatan_pemeriksa: string;
  periode: string;
  pendapatan_nasional: string;
  pendapatan_kcp_nasional: string;
  proporsi: string;
  url_file:string;
}
export interface VerifikasiProduksiI {
  id_regional: number;
  triwulan: number;
  tahun_anggaran: number;
  nama_regional: string;
  total_lpu: string;
  total_lpu_prognosa: string | null;
  total_lpk: string;
  total_lpk_prognosa: string | null;
  total_lbf: string;
  total_lbf_prognosa: string | null;
  total_produksi: string;
  status: string;
}

export interface IFormSyncBiaya {
  id_kpc: string;
  tahun: string;
  triwulan: string;
  id_kprk: string;
  id_regional: string;
}
export interface IRekonsiliasi {
  id: number | string;
  id_penyelenggara: number;
  id_kelurahan: number | string;
  id_jenis_kantor: number;
  id_kantor: number;
  nama: string;
  nama_kantor: string;
  alamat: string;
  longitude: number;
  latitude: number;
  jenis_kantor: string;
  id_provinsi: string|number
  id_kabupaten_kota: string|number
  id_kecamatan: string|number
  nama_penyelenggara: string;
  nama_jenis_kantor: string;
  nama_kelurahan: string;
  nama_kecamatan: string;
  nama_kabupaten: string;
  nama_provinsi: string;
}
export interface ITargetAnggaran {
  id?:number;
  tahun: number;
  nominal: number;
}
export interface KeteranganI {
  id: string;
  id_regional: string;
  id_kprk: string;
  id_kpc: string;
  tahun_anggaran: string;
  triwulan: string;
  kategori_biaya: string;
  koderekening: string;
  nama_rekening: string;
  bulan: string;
  bilangan: string;
  nominal: number;
  status: string;
  keterangan: string;
  kode_petugas: string;
  lampiran: string;
}

export interface ApiLogI {
  id: number;
  komponen: string;
  tanggal: string;
  ip_address: string;
  platform_request: string;
  total_records: number;
  successful_records: number;
  available_records: number;
  status: string;
  created_at: string;
  updated_at: string;
  proses: string;
  persentase: string;
}
export interface UserLogI {
  id: number;
  nama_user: string;
  timestamp: string;
  id_user: number;
  aktifitas: string;
  modul: string;
}
export interface LockVerifikasiI {
  id: number;
  tahun: number;
  bulan: number;
  status: boolean;
  created_at: string;
  updated_at: string;
}
export interface MonitoringKantorUsulanI {
  id_parent: number;
  tanggal: string;  // Assuming the format is a date-time string
  petugas_list: Petugas[];
  kode_pos: string;
  kantor_lpu: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  nilai_akhir: number;
  kesimpulan: string;
  aspek_operasional: number;
  aspek_pemahaman_pegawai: number;
  aspek_pemahaman_wilayah: number;
  aspek_sarana_prasarana: number;
}
export interface VerifikasiLapanganI {
  id: number;
  tanggal: string;  // Format date-time string
  petugas_list: Petugas[];
  kode_pos: string;
  kantor_lpu: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string; // Bisa kosong
  aspek_operasional: number;
  aspek_sarana: number;
  aspek_wilayah: number;
  aspek_pegawai: number;
  nilai_akhir: number;
  kesimpulan: string;
}
export interface PerbaikanRinganI {
  id: number;
  tanggal: string;  // Format date-time string
  petugas_list: Petugas[];
  kode_pos: string;
  kantor_lpu: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string; // Bisa kosong
  hasil_verifikasi: number;
  kesimpulan: string;
}
export interface PenyelenggaraI {
  id: string | number;
  nama: string;
}
export interface ProduksiPendapatanI {
  id: number;
  group_produk: string;
  bulan: number;
  tahun:number;
  bisnis: string;
  status: string;
  tanggal: number;
  jml_produksi: number;
  jml_pendapatan: number;
  koefisien: number;
  transfer_pricing: number;
}