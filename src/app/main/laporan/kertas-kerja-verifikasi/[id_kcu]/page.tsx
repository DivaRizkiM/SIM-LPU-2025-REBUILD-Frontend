'use client'
import { NextPage } from "next";
import style from '../index.module.css'
import { Button, buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tahunData, triwulanData } from "@/lib/data";
import Combobox from "@/components/tools/combobox";
import { useEffect, useState } from "react";
import { FormCustomOption } from "../../../../../../store/state";
import { getDetailKertasKerjaVerifikasi, getExportDetailKertasKerjaVerifikasi, getExportKertasKerjaVerifikasi } from "../../../../../../services";
import { useParams, useRouter } from "next/navigation";
import { RegionalI } from "../../../referensi/regional/columns";
import { IkertasKerjaLaporan } from "../../../../../../services/types";
import { QueryParams, buildQueryParam, getQuarter, isLastPage, numFormatter } from "../../../../../../helper";
import { ArrowLeftCircle, Download, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DetailKertasKerjaVerifikasi:NextPage = ()=>{
    const router = useRouter()
    const params = useParams()
    const {id_kcu} = params
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [tahunSelected, setTahunSelected] = useState<string>('');
    const [triwulanSelected, setTriwulanSelected] = useState<string>('');
    const [dataSource, setDataSource] = useState<IkertasKerjaLaporan[]>()
    const [isRegionalLoading,setIsRegionalLoading] = useState<boolean>(false)
    const [isExportLoading,setIsExportLoading] = useState<boolean>(false)
    const now = new Date(); // Membuat objek Date untuk mendapatkan tanggal dan waktu saat ini
    
    const firstInit = async()=> {
        fetchData(tahunSelected, triwulanSelected);
    }
    useEffect(()=>{
        firstInit()
        /* eslint-disable react-hooks/exhaustive-deps */
    },[])

    const fetchData = async(tahun='',triwulan='') => {
        setIsLoading(true)
        const tempParams: QueryParams = {};
        tempParams.id_kprk = id_kcu as string
        if (tahun && tahun != "all"){
            tempParams.tahun = tahun
        }
        if (triwulan && triwulan != "all"){
            tempParams.twiwulan = triwulan
        }
        const params = buildQueryParam(tempParams) || '';
        
        await getDetailKertasKerjaVerifikasi(router, params)
        .then((res)=> {
          setDataSource(res.data.data)
        })
        .catch((res)=> {
            console.log(res);
        })
        .finally(()=> {
            setIsLoading(false)
        })
    }

    const exportData = async()=>{
        setIsExportLoading(true)
        const tempParams: QueryParams = {};
        tempParams.id_kprk = id_kcu as string

        if (tahunSelected && tahunSelected != ""){
            tempParams.tahun = tahunSelected
        }
        if (triwulanSelected && triwulanSelected != ""){
            tempParams.twiwulan = triwulanSelected
        }
        const params = buildQueryParam(tempParams) || '';
        await getExportDetailKertasKerjaVerifikasi(router,params)
            .then((res)=>{
                const url = window.URL.createObjectURL((res.data as any));
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const fileNameParts = [`kertas_kerja_verifikasi`];

                // Tambahkan triwulanSelected jika ada nilainya
                if (dataSource && dataSource[0]) {
                    fileNameParts.push(dataSource[0].nama_kprk);
                }
                // Tambahkan tahunSelected jika ada nilainya
                if (tahunSelected) {
                    fileNameParts.push(tahunSelected);
                }

                // Tambahkan triwulanSelected jika ada nilainya
                if (triwulanSelected) {
                    fileNameParts.push(triwulanSelected);
                }

                // Gabungkan semua bagian nama file dengan underscore
                const fileName = fileNameParts.join('_') + '.xlsx';

                // Setel nama file yang dihasilkan
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch((err)=> {
                console.log('res export data error: ',err);
            })
            .finally(()=>{
                setIsExportLoading(false)
            })
    }

    const filterByTahun =(value: string)=> {
        setTahunSelected(value)
        fetchData( value, triwulanSelected);
    }
    const filterByTriwulan =(value: string)=> {
        setTriwulanSelected(value)
        fetchData( tahunSelected, value);
    }

    return(
        <div className="px-3 md:px-7 mt-3">
             <Link href={`./`} className={cn(
            buttonVariants({variant: 'ghost'}),
            'me-auto mb-3'
            )}> 
                <ArrowLeftCircle className="me-2"/>
                Kembali
            </Link>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full md:w-auto">
                <Button className="" onClick={exportData}>
                    {isExportLoading ? (
                        <Loader2 className="me-2 h-4 w-4 animate-spin"/>
                    ):(
                        <Download className="me-2 w-4 h-4"/> 
                    )}
                    Export Excel
                </Button>
                <Select
                    value={tahunSelected}
                    onValueChange={filterByTahun}
                >
                    <SelectTrigger className="md:col-start-4">
                    <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value={'all'}>Semua Tahun</SelectItem>
                        {tahunData.map((t,index)=>(
                        <SelectItem value={t.value} key={index}>{t.label}</SelectItem>
                        ))}
                    </SelectGroup>
                    </SelectContent>
                </Select>
                <Select 
                    value={triwulanSelected}
                    onValueChange={filterByTriwulan}
                >
                    <SelectTrigger className="">
                    <SelectValue placeholder="Triwulan" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value={'all'}>Semua Triwulan</SelectItem>
                        {triwulanData.map((t,index)=>(
                        <SelectItem value={t.value} key={index}>{t.label}</SelectItem>
                        ))}
                    </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <h1 className="text-center my-7 md:my-3">KERTAS KERJA VERIFIKASI DOKUMEN <br/>PENYELENGGARAAN LAYANAN POS UNIVERSAL PT. POS INDONESIA TRIWULAN {triwulanSelected || getQuarter(now.getMonth()+1)} PROGNOSA TAHUN ANGGARAN {tahunSelected || now.getFullYear()}
</h1>
            <div className={`relative overflow-x-scroll`}>
                <table className={style.table}>
                    <thead className="[&:nth-child(3):bg-red-900]">
                        {/* First row of header group */}
                        <tr>
                            <th rowSpan={3}>Kantor Pos Pemeriksa</th>
                            <th rowSpan={3}>Nama KPC Produksi</th>
                            <th rowSpan={3}>Pendapatan</th>
                            <th colSpan={4}>REKAPITULASI PRODUKSI DAN REALISASI</th>
                            <th colSpan={2} rowSpan={2}>DEVIASI LAPORAN KC / KCU DGN HASIL VERIFIKASI	</th>
                            <th rowSpan={3}>DEVIASI PRODUKSI DGN BIAYA HASIL VERIFIKASI</th>
                        </tr>
                        {/* Second row of header group */}
                        <tr>
                            <th colSpan={2}>Laporan KPC</th>
                            <th colSpan={2}>Hasil Verifikasi</th>
                        </tr>
                        {/* Third row of header group */}
                        <tr>
                            <th>Biaya</th>
                            <th>Pendapatan</th>
                            <th>Biaya</th>
                            <th>Pendapatan</th>
                            <th>Biaya</th>
                            <th>Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataSource && dataSource.length > 0 ? (dataSource?.map((data,key)=>(
                            <tr key={key}>
                                <td>{data.nama_kprk}</td>
                                <td>{data?.nama_kpc}</td>
                                <td>{data?.pendapatan}</td>
                                <td>{numFormatter(data.hasil_pelaporan_biaya)}</td>
                                <td>{numFormatter(data.hasil_pelaporan_pendapatan)}</td>
                                <td>{numFormatter(data.hasil_verifikasi_biaya)}</td>
                                <td>{numFormatter(data.hasil_verifikasi_pendapatan)}</td>
                                <td>{numFormatter(data.deviasi_biaya)}</td>
                                <td>{numFormatter(data.deviasi_biaya)}</td>
                                <td>{numFormatter(data.deviasi_akhir)}</td>
                            </tr>
                        ))): (
                            <tr className="text-center w-full">
                                <td colSpan={8} className="h-24">
                                    {isLoading ? '' : 'Data tidak ditemukan'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {isLoading && (
                    <div className="fixed md:absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin"/>
                    </div>
                )}
            </div>
        </div>
    )
}
export default DetailKertasKerjaVerifikasi