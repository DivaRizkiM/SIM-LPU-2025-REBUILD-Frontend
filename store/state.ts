/* eslint-disable no-unused-vars */
import React, { ReactComponentElement, ReactNode } from "react";

export type RoleId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface RolePermission {
	module: string;
	canView: boolean;
	canCreate: boolean;
	canUpdate: boolean;
	canDelete: boolean;
}


export interface Role {
	id: number;
	name: string;
	permissions: RolePermission[];
}

export enum ModuleName {
	DASHBOARD = "dashboard",
	DASHBOARD_PRODUKSI_PENDAPATAN = "dashboard_produksi_pendapatan",
	MONITORING = "monitoring",
	REKONSILIASI = "rekonsiliasi",
	MASTER_DATA = "master_data",
	PROFIL_KCP = "profil_kcp",
	VERIFIKASI_BIAYA_ATRIBUSI = "verifikasi_biaya_atribusi",
	VERIFIKASI_BIAYA_RUTIN = "verifikasi_biaya_rutin",
	VERIFIKASI_PRODUKSI = "verifikasi_produksi",
	BIAYA_NPP_NASIONAL = "biaya_npp_nasional",
	BIAYA_LTK = "biaya_ltk",
	BIAYA_GAJI_PEGAWAI = "biaya_gaji_pegawai",
	LAPORAN_KERTAS_KERJA_VERIFIKASI = "laporan_kertas_kerja_verifikasi",
	LAPORAN_VERIFIKASI_PENDAPATAN = "laporan_verifikasi_pendapatan",
	LAPORAN_PROGNOSA_PENDAPATAN = "laporan_prognosa_pendapatan",
	LAPORAN_VERIFIKASI_BIAYA = "laporan_verifikasi_biaya",
	LAPORAN_PROGNOSA_BIAYA = "laporan_prognosa_biaya",
	LAPORAN_REALISASI_DANA_LPU = "laporan_realisasi_dana_lpu",
	LAPORAN_DEVIASI_DANA_LPU = "laporan_deviasi_dana_lpu",
	LAPORAN_BERITA_ACARA_PENARIKAN = "laporan_berita_acara_penarikan",
	LAPORAN_BERITA_ACARA_VERIFIKASI = "laporan_berita_acara_verifikasi",
	LAPORAN_BERITA_ACARA_VERIFIKASI_BULANAN = "laporan_berita_acara_verifikasi_bulanan",
	LAPORAN_PROFIL_BO_LPU = "laporan_profil_bo_lpu",
	LAPORAN_CAKUPAN_WILAYAH = "laporan_cakupan_wilayan",
	LAPORAN_MONITORING_KANTOR_EXISTING = "laporan_monitoring_kantor_existing",
	LAPORAN_MONITORING_KANTOR_USULAN = "laporan_monitoring_kantor_usulan",
	LAPORAN_VERIFIKASI_LAPANGAN = "laporan_verifikasi_lapangan",
	LAPORAN_PERBAIKAN_RINGAN = "laporan_perbaikan_ringan",
	MANAJEMEN_API = "manajemen_api",
	SYNC_LOG = "sync_log",
	USER_LOG = "user_log",
	REFERENSI_REKENING_BIAYA = "referensi_rekening_biaya",
	REFERENSI_REKENING_PRODUKSI = "referensi_rekening_produksi",
	REFERENSI_PROVINSI = "referensi_provinsi",
	REFERENSI_KABUPATEN_KOTA = "referensi_kabupaten_kota",
	REFERENSI_KECAMATAN = "referensi_kecamatan",
	REFERENSI_KELURAHAN = "referensi_kelurahan",
	REFERENSI_NAMA_PENYELENGGARA = "referensi_nama_penyelenggara",
	REFERENSI_JENIS_KANTOR = "referensi_jenis_kantor",
	REFERENSI_REGIONAL = "referensi_regional",
	REFERENSI_KC_KCU = "referensi_kc_kcu",
	REFERENSI_KATEGORI_BIAYA = "referensi_kategori_biaya",
	REFERENSI_TIPE_BISNIS = "referensi_tipe_bisnis",
	MANAJEMEN_USER = "manajemen_user",
	GANTI_PASSWORD = "ganti_password",
	MANAJEMEN_KUNCI_VERIFIKASI = "manajemen_kunci_verifikasi"
  }

export interface ModalProps {
	icon?: React.FC<React.SVGProps<SVGSVGElement>>;
	imgIcon?: string;
	title?: ReactNode;
	desc?: ReactNode;
	type?: "modal" | "drawer";
	fullWidth?:boolean,
	component?: ReactComponentElement<any>;
}
export interface AlertDialogProps {
	title: ReactNode;
	desc?: ReactNode;
	type: 'delete' | 'update' | "sync" | 'lock' | 'unlock' | 'stop'
	component?: ReactComponentElement<any>;
	onSubmit: ()=>Promise<void>
}

export enum Severities {
	SUCCESS = "success",
	ERROR = "error",
	WARNING = "warning",
	INFO = "info",
}
export interface IToast {
	message?: string;
	severity?: Severities;
}

export interface GlobalStateType {
	isMobile: boolean;
	isCollapsed?: boolean;
	idCollapseSelected: number;
	isToast?: IToast;
	isModal?: ModalProps;
	alertDialog?: AlertDialogProps
}

// DEFAULT VALUE GLOBAL STATE
export const globalState: GlobalStateType = {
	isMobile: false,
	idCollapseSelected: -1
}

export interface FormCustomOption { value: string | number; label: ReactNode }