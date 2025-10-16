import { InitialContextType } from "../store";
import UseGuardInstance, { nonGuardInstance } from "./instance";
import { IFormLogin, IFormProvinsi, IFormSyncBiaya, IFormVerifikasiBiayaAtribusi, IRekonsiliasi, ITargetAnggaran, MethodAPI, ResponseAPI } from "./types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

//Authentication
export const postSignIn = (payload: Partial<IFormLogin>) => {
  return nonGuardInstance().post<ResponseAPI>(
    "/login",
    payload
  );
};
export const postLogout = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/logout${payload}`);
};
//Rekening Biaya
export const getRekeningBiaya = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/rekening-biaya${payload}`);
};
//Rekening Produksi
export const getRekeningProduksi = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/rekening-produksi${payload}`);
};
//Provinsi
export const getProvinsi = (
  router: AppRouterInstance,
  payload: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/provinsi/${payload}`);
};
export const getDetailProvinsi = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/provinsi/${id}`);
};
export const postProvinsi = (
  router: AppRouterInstance,
  payload: IFormProvinsi
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/provinsi`, payload);
};
export const putProvinsi = (
  router: AppRouterInstance,
  payload: IFormProvinsi,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/provinsi/${id}`,
    payload
  );
};
export const deleteProvinsi = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/provinsi/${id}`);
};
export const syncProvinsi = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncProvinsi`);
};
//Kota
export const getKabKota = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kabupaten-kota${payload}`);
};
export const getDetailKabKota = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kabupaten-kota/${id}`);
};
export const postKabKota = (
  router: AppRouterInstance,
  payload: IFormProvinsi
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/kabupaten-kota`, payload);
};
export const putKabKota = (
  router: AppRouterInstance,
  payload: IFormProvinsi,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/kabupaten-kota/${id}`,
    payload
  );
};
export const deleteKabKota = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/kabupaten-kota/${id}`);
};
export const syncKabKota = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncKabupaten-kota`);
};
//Kecamatan
export const getKecamatan = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kecamatan${payload}`);
};
export const getDetailKecamatan = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kecamatan/${id}`);
};
export const postKecamatan = (
  router: AppRouterInstance,
  payload: IFormProvinsi
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/kecamatan`, payload);
};
export const putKecamatan = (
  router: AppRouterInstance,
  payload: IFormProvinsi,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/kecamatan/${id}`,
    payload
  );
};
export const deleteKecamatan = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/kecamatan/${id}`);
};
export const syncKecamatan = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncKecamatan`);
};

//Kelurahan
export const getKelurahan = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kelurahan${payload}`)
};
export const getDetailKelurahan = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kelurahan/${id}`);
};
export const postKelurahan = (
  router: AppRouterInstance,
  payload: IFormProvinsi
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/kelurahan`, payload);
};
export const putKelurahan = (
  router: AppRouterInstance,
  payload: IFormProvinsi,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/kelurahan/${id}`,
    payload
  );
};
export const deleteKelurahan = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/kelurahan/${id}`);
};
export const syncKelurahan = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncKelurahan`);
};
//Penyelenggara
export const getPenyelenggara = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/penyelenggara${payload}`);
};
export const getDetailPenyelenggara = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/penyelenggara/${id}`);
};
export const postPenyelenggara = (
  router: AppRouterInstance,
  payload: IFormProvinsi
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/penyelenggara`, payload);
};
export const putPenyelenggara = (
  router: AppRouterInstance,
  payload: IFormProvinsi,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/penyelenggara/${id}`,
    payload
  );
};
export const deletePenyelenggara = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/penyelenggara/${id}`);
};
//Jenis Kantor
export const getJenisKantor = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/jenis-kantor${payload}`);
};
export const getDetailJenisKantor = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/jenis-kantor/${id}`);
};
export const postJenisKantor = (
  router: AppRouterInstance,
  payload: IFormProvinsi
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/jenis-kantor`, payload);
};
export const putJenisKantor = (
  router: AppRouterInstance,
  payload: IFormProvinsi,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/jenis-kantor/${id}`,
    payload
  );
};
export const deleteJenisKantor = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/jenis-kantor/${id}`);
};
//Regional
export const getRegional = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/regional${payload}`);
};
//KPRK atau KC-KCU 
export const getKPRK = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kprk${payload}`);
};
export const getKPRKByRegional = (
  router: AppRouterInstance,
  id: string | number,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kprk-regional?id_regional=${id}&limit=999`);
};
export const getDetailKPRK = (
  router: AppRouterInstance,
  id: number
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kprk/${id}`);
};
//Kategori Biaya
export const getKategoriBiaya = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kategori-biaya${payload}`);
};
//Jenis Biaya
export const getJenisBisnis = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/jenis-bisnis${payload}`);
};
//Manajemen User
export const getUser = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/user${payload}`);
};
export const getDetailUser = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/user/${id}`);
};
export const postUser = (
  router: AppRouterInstance,
  payload: IFormProvinsi
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/user`, payload);
};
export const putUser = (
  router: AppRouterInstance,
  payload: IFormProvinsi,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/user/${id}`,
    payload
  );
};
export const deleteUser = (
  router: AppRouterInstance,
  id: number,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/user/${id}`);
};
//User Status 
export const getUserStatus = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/status${payload}`);
};
//User Status Group
export const getStatusGroup = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/grup${payload}`);
};
//Biaya Atribusi
export const getBiayaAtribusi = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/atribusi-tahun${payload}`);
};
export const getBiayaAtribusiRegional = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/atribusi-regional${payload}`);
};
export const getBiayaAtribusiKCU = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/atribusi-kcu${payload}`);
};
export const getDetailBiayaAtribusi = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/atribusi-detail${payload}`);
};
export const postVerifikasiBiayaAtribusi = (
  router: AppRouterInstance,
  id: number | string,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/atribusi-verifikasi?id_biaya_atribusi_detail=${id}`, payload);
};
//Biaya Rutin
export const getBiayaRutin = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/rutin-tahun${payload}`);
};
export const getBiayaRutinRegional = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/rutin-regional${payload}`);
};
export const getBiayaRutinKPC = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/rutin-kcu${payload}`);
};
export const getBiayaRutinKCU = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/rutin-kpc${payload}`);
};
export const getDetailBiayaRutin = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/rutin-detail${payload}`);
};
export const postVerifikasiBiayaRutin = (
  router: AppRouterInstance,
  id: number | string,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/rutin-verifikasi?id_verifikasi_biaya_rutin_detail=${id}`, payload);
};
export const postAllVerifikasiBiayaRutin = (
  router: AppRouterInstance,
  id: number | string,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/rutin-verifikasi/all?id_verifikasi_biaya_rutin_detail=${id}`, payload);
};
//NPP Nasional
export const getNppNasional = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/npp-tahun${payload}`);
};
//Ltk
export const getLtk = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/ltk-tahun${payload}`);
};
export const getGajiPegawai = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/gaji-pegawai-tahun${payload}`);
};
export const getDetailNppNasional = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/npp-detail${payload}`);
};
export const getDetailGajiPegawai = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/gaji-pegawai-detail${payload}`);
};
export const getDetailLtk = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/ltk-detail${payload}`);
};
export const postVerifikasiNppNasional = (
  router: AppRouterInstance,
  id: number | string,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/npp-verifikasi?npp-verifikasi=${id}`, payload);
};
export const postVerifikasiPegawai = (
  router: AppRouterInstance,
  id: number | string,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/gaji-pegawai-verifikasi?pegawai-verifikasi=${id}`, payload);
};
export const postVerifikasiLtk = (
  router: AppRouterInstance,
  id: number | string,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/ltk-verifikasi?ltk-verifikasi=${id}`, payload);
};
//Verifikasi Produksi
export const getVerifikasiProduksi = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/produksi-tahun${payload}`);
};
export const getVerifikasiProduksiByRegional = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/produksi-regional${payload}`);
};
export const getVerifikasiProduksiByKCU = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/produksi-kcu${payload}`);
};
export const getVerifikasiProduksiByKCP = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/produksi-kpc${payload}`);
};
export const getDetailVerifikasiProduksi = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/produksi-detail${payload}`);
};
export const postVerifikasiProduksi = (
  router: AppRouterInstance,
  id: number | string,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/produksi-verifikasi?id_produksi_detail=${id}`, payload);
};
export const postAllVerifikasiProduksi = (
  router: AppRouterInstance,
  id: number | string,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/produksi-verifikasi/all?id_produksi_detail=${id}`, payload);
};
//Profil KPC
export const getKpc = (
  router: AppRouterInstance,
  payload: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kpc/${payload}`);
};
export const getKpcByKcu = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kpc-kprk?id_kprk=${id}`);
};
export const getDetailKpc = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/kpc/${id}`);
};
export const postKpc = (
  router: AppRouterInstance,
  payload: IFormProvinsi
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/kpc`, payload);
};
export const putKpc = (
  router: AppRouterInstance,
  payload: IFormProvinsi,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/kpc/${id}`,
    payload
  );
};
export const deleteKpc = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/kpc/${id}`);
};
//Petugas KPC
export const getPetugasbyKpc = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/petugas-per-kpc?id_kpc=${id}`);
};
export const getDetailPetugasKpc = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/petugas-kpc/${id}`);
};
export const postPetugasKpc = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/petugas-kpc`, payload);
};
export const putPetugasKpc = (
  router: AppRouterInstance,
  payload: any,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/petugas-kpc/${id}`,
    payload
  );
};
export const deletePetugasKpc = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/petugas-kpc/${id}`);
};

// LAPORAN
// Laporan Kertas Kerja Verifikasi
export const getKertasKerjaVerifikasi = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/kertas-kerja-verifikasi${payload}`
  );
};
export const getDetailKertasKerjaVerifikasi = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/kertas-kerja-verifikasi/detail${payload}`
  );
};
export const getExportKertasKerjaVerifikasi = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/kertas-kerja-verifikasi/export${payload}`, {
    responseType: 'blob'
  }
  );
};
export const getExportDetailKertasKerjaVerifikasi = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/kertas-kerja-verifikasi/export-detail${payload}`, {
    responseType: 'blob'
  }
  );
};
// Laporan verifikasi pendapatan
export const getVerifikasiPendapatan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-verifikasi-pendapatan${payload}`
  );
};
export const getExportVerifikasiPendapatan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-verifikasi-pendapatan/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Laporan prognosa pendapatan
export const getPrognosaPendapatan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-prognosa-pendapatan${payload}`
  );
};
export const getExportPrognosaPendapatan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-prognosa-pendapatan/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Laporan Monitoring Kantor Usulan
export const getMonitoringKantorUsulan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/monitoring-kantor-usulan${payload}`
  );
};
export const getExportMonitoringKantorUsulan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/monitoring-kantor-usulan/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Laporan Verifikasi Lapangan
export const getVerifikasiLapangan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/verifikasi-lapangan${payload}`
  );
};
export const getExportVerifikasiLapangan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/verifikasi-lapangan/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Laporan Perbaikan Ringan
export const getPerbaikanRingan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/perbaikan-ringan${payload}`
  );
};
export const getExportPerbaikanRingan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/perbaikan-ringan/export${payload}`, {
    responseType: 'blob'
  }
  );
};

// PEMETAAN
//Monitoring MAPS 
export const getKpcKoordinat = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/monitoring${payload}`
  );
};
//Rekonsiliasi
export const getRekonsiliasi = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/rekonsiliasi${payload}`
  );
};
export const getDetailRekonsiliasi = (
  router: AppRouterInstance,
  id: number | string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/rekonsiliasi/${id}`
  );
};
export const postRekonsiliasi = (
  router: AppRouterInstance,
  payload: IRekonsiliasi,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(
    `/rekonsiliasi`,
    payload
  );
};
export const putRekonsiliasi = (
  router: AppRouterInstance,
  payload: IRekonsiliasi,
  id: number | string
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/rekonsiliasi/${id}`,
    payload
  );
};
export const ImportRekonsiliasi = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(
    `/rekonsiliasi-import`,
    payload
  );
};
export const deleteRekonsiliasi = (
  router: AppRouterInstance,
  id: number | string,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/rekonsiliasi/${id}`);
};
//MASTER DATA
//Target Anggaran
export const getTargetAnggaran = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/target-anggaran${payload}`
  );
};
export const getDetailTargetAnggaran = (
  router: AppRouterInstance,
  id: number | string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/target-anggaran/${id}`
  );
};
export const postTargetAnggaran = (
  router: AppRouterInstance,
  payload: ITargetAnggaran,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(
    `/target-anggaran`,
    payload
  );
};
export const putTargetAnggaran = (
  router: AppRouterInstance,
  payload: ITargetAnggaran,
  id: string | number
) => {
  return UseGuardInstance(router).put<
    ResponseAPI
  >(
    `/target-anggaran/${id}`,
    payload
  );
};
export const deleteTargetAnggaran = (
  router: AppRouterInstance,
  id: string | number,
) => {
  return UseGuardInstance(router).delete<
    ResponseAPI
  >(`/target-anggaran/${id}`);
};
// Laporan verifikasi biaya
export const getVerifikasiBiaya = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-verifikasi-biaya${payload}`
  );
};
export const getExportVerifikasiBiaya = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-verifikasi-biaya/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Laporan prognosa biaya
export const getPrognosaBiaya = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-prognosa-biaya${payload}`
  );
};
export const getExportPrognosaBiaya = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-prognosa-biaya/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Laporan realisasi dana LPU
export const getRealisasiDanaLPU = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-realisasi-so-lpu${payload}`
  );
};
export const getExportRealisasiDanaLPU = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-realisasi-so-lpu/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Laporan deviasi dana LPU
export const getDeviasiDanaLPU = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-deviasi-so-lpu${payload}`
  );
};
export const getExportDeviasiDanaLPU = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/laporan-deviasi-so-lpu/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Berita Acara Penarikan
export const postExportBeritaAcaraPenarikan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).post<Blob>(
    `/berita-acara-penarikan/pdf`,
    payload,
    {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
    }
  );
};
// Berita Acara Verifikasi
export const postExportBeritaAcaraVerifikasi = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).post<Blob>(
    `/berita-acara-verifikasi`,
    payload,
    {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
    }
  );
};
{
  // export const postExportBeritaAcaraVerifikasi = (
  //   router: AppRouterInstance,
  //   payload: any,
  // ) => {
  //   return UseGuardInstance(router).post<
  //     ResponseAPI
  //   >(
  //     `/berita-acara-verifikasi`,
  //     payload
  //   );
  // };
}
// Berita Acara Verifikasi Bulanan
export const postExportBeritaAcaraVerifikasiBulanan = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).post<Blob>(
    `/berita-acara-verifikasi-bulanan`,
    payload,
    {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf',
      },
    }
  );
};
{
  // export const postExportBeritaAcaraVerifikasiBulanan = (
  //   router: AppRouterInstance,
  //   payload: any,
  // ) => {
  //   return UseGuardInstance(router).post<
  //     ResponseAPI
  //   >(
  //     `/berita-acara-verifikasi-bulanan`,
  //     payload
  //   );
  // };
}
// Profil BO LPU
export const getProfilBoLpu = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/profile-bo-lpu${payload}`
  );
};
export const getExportProfilBoLpu = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/profile-bo-lpu/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Cakupan Wilayah
export const getCakupanWilayah = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/cakupan-wilayah${payload}`
  );
};
export const getExportCakupanWilayah = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/cakupan-wilayah/export${payload}`, {
    responseType: 'blob'
  }
  );
};
// Monitoring Kantor Existing
export const getMonitoringKantorExisting = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/monitoring-kantor-existing${payload}`
  );
};
export const getExportMonitoringKantorExisting = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/monitoring-kantor-existing/export${payload}`, {
    responseType: 'blob'
  }
  );
};
//SYNC MANAJEMEN API
export const syncRegional = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncRegional`);
};
export const syncKCU = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncKCU`);
};
export const syncKCP = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncKPC`);
};
export const syncPetugasKCP = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncPetugasKCP`);
};
export const syncRekeningBiaya = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncRekeningBiaya`);
};
export const syncTipeBisnis = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncTipeBisnis`);
};
export const syncRekeningProduksi = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncRekeningProduksi`);
};
export const syncKategoriBiaya = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncKategoriBiaya`);
};
export const syncKategoriPendapatan = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncKategoriPendapatan`);
};
export const syncPendapatan = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncPendapatan${payload}`);
};
export const syncLayananKurir = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncLayananKurir`);
};
export const syncLayananJasaKeuangan = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncLayananJasaKeuangan`);
};
export const syncLampiranBiaya = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncLampiranBiaya${payload}`);
};

//SYNC API FORM
export const syncBiaya = (
  router: AppRouterInstance,
  payload: string
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncBiaya${payload}`);
};
export const syncProduksi = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncProduksi${payload}`);
};
export const syncBiayaPrognosa = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncBiaya-prognosa${payload}`);
};
export const syncBiayaAtribusi = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncBiayaAtribusi${payload}`);
};
export const syncProduksiPrognosa = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncProduksi-prognosa${payload}`);
};
export const syncNppNasional = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncNpp${payload}`);
};
export const syncLTK = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncLTK`);
};
export const syncLtk = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncLtk${payload}`);
};
export const syncMitraLpu = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncMitraLpu${payload}`);
};
export const syncProduksiNasional = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncProduksi-nasional${payload}`);
};
export const syncDashboardProduksiPendapatan = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/syncDashboardProduksiPendapatan${payload}`);
};
//SYNC LOG
export const getApiLog = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/api-log${payload}`
  );
};
export const getDetailApiLog = (
  router: AppRouterInstance,
  id: number,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/api-log-detail/${id}`);
};
export const stopSync = (
  router: AppRouterInstance,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/stop-sync`);
};

//Dashboard
export const getRealisasiAnggaran = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/RealisasiAnggaran-gauge${payload}`
  );
};
export const getRealisasiBiayaPie = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/RealisasiBiaya-pie${payload}`
  );
};
export const getRealisasiBiayaChart = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/RealisasiBiaya-chart${payload}`
  );
};
export const getRealisasiPendapatanDonut = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/RealisasiPendapatan-donut${payload}`
  );
};
export const getTargetAnggaranDashboard = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/target-anggaran-dashboard${payload}`
  );
};
export const getJumlahLPU = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/kpc-count${payload}`
  );
}
export const getJumlahMitraLPU = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/mitra-count${payload}`
  );
}
//Sync Log
export const getAllUserLog = (
  router: AppRouterInstance,
  payload: any,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(
    `/user-log${payload}`
  );
};
//Lock Verifikasi Management
export const getLockVerifikasi = (
  router: AppRouterInstance,
  payload: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/lock-verifikasi/${payload}`);
};
export const getDetailLockVerifikasi = (
  router: AppRouterInstance,
  id: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/lock-verifikasi/${id}`);
};
export const postLockVerifikasi = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/lock-verifikasi`, payload);
};
export const putLockVerifikasi = (
  router: AppRouterInstance,
  payload: any,
  id: string | number
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(
    `/lock-verifikasi-edit/${id}`,
    payload
  );
};
export const deleteLockVerifikasi = (
  router: AppRouterInstance,
  id: number,
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/lock-verifikasi-hapus/${id}`);
};

//Ganti Password
export const postUpdatePassword = (
  router: AppRouterInstance,
  payload: any
) => {
  return UseGuardInstance(router).post<
    ResponseAPI
  >(`/updatePassword`, payload);
};
//Dashboard Produksi Pendapatan
export const getProduksiPendapatan = (
  router: AppRouterInstance,
  payload: string,
) => {
  return UseGuardInstance(router).get<
    ResponseAPI
  >(`/dpp-tahun${payload}`);
};
export const getDetailProduksiPendapatan = (
  router: AppRouterInstance,
  payload: string,
) => {
  return UseGuardInstance(router).get<ResponseAPI>(
    `/dpp-detail${payload}`
  );
};

export const postVerifikasiProduksiPendapatan = (
  router: AppRouterInstance,
  selectedID: string,
  payload: any,
) => {
  return UseGuardInstance(router).post<ResponseAPI>(
    `/dpp-verifikasi?id_dpp=${selectedID}`,
    payload
  );
};

export const deleteProduksiPendapatan = (
  router: AppRouterInstance,
  payload: string,
) => {
  return UseGuardInstance(router).post<ResponseAPI>(
    `/dpp-hapus/${payload}`,
  );
};