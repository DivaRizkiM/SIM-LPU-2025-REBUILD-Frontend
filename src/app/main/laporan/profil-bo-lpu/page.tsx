/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { NextPage } from "next";
import style from './index.module.css'
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tahunData, triwulanData } from "@/lib/data";
import Combobox from "@/components/tools/combobox";
import { useEffect, useState } from "react";
import { FormCustomOption } from "../../../../../store/state";
import { getExportProfilBoLpu, getExportVerifikasiPendapatan, getKPRK, getKPRKByRegional, getKertasKerjaVerifikasi, getProfilBoLpu, getRegional, getVerifikasiPendapatan } from "../../../../../services";
import { useRouter } from "next/navigation";
import { RegionalI } from "../../referensi/regional/columns";
import { ILaporanVerifikasiPendapatan, ProfilBoLpuI } from "../../../../../services/types";
import { QueryParams, buildQueryParam, isLastPage } from "../../../../../helper";
import { Download, Loader2 } from "lucide-react";
import { kcuI } from "../../referensi/kc-kcu/columns";
import { toast } from "@/components/ui/use-toast";
import { PaginationI } from "@/lib/types";
import Paginator from "@/components/tools/paginator";

const ProfilBoLpu:NextPage = ()=>{
    const router = useRouter()
    const [page, setPage] = useState<number>(1);
    const pageSize:number = 10;
    const [offset,setOffset] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [tahunSelected, setTahunSelected] = useState<string>('');
    const [triwulanSelected, setTriwulanSelected] = useState<string>('');
    const [dataSource, setDataSource] = useState<ProfilBoLpuI[]>()
    const [regionalSelected, setRegionalSelected] = useState<string>('')
    const [regionalOptions, setRegionalOptions] = useState<Array<FormCustomOption>>([])
    const [isRegionalLoading,setIsRegionalLoading] = useState<boolean>(false)
    const [kcuSelected, setKcuSelected] = useState<string>('')
    const [kcuOptions, setkcuOptions] = useState<Array<FormCustomOption>>([])
    const [isExportLoading,setIsExportLoading] = useState<boolean>(false)

    const [pagination, setPagination] = useState<PaginationI>({
        currentPage: 1,
        totalPages: 0,
        startItem: 0,
        endItem: 0,
        total_data: 0
    })
    
    const firstInit = async()=> {
        setIsRegionalLoading(true)
        await getRegional(router,'?limit=99')
          .then((response)=>{
              let regionals:Array<any> = response.data.data.map((item:RegionalI) => ({
                  value: item.id.toString(),
                  label: item.nama,
              }));
              regionals.unshift({
                value: '',
                label: 'Semua regional'
              })
              setRegionalOptions(regionals)
          })
          .catch((err)=>{
              console.log('Err: ',err);
          })
          .finally(()=>{
              setIsRegionalLoading(false)
          })

        fetchData(page, tahunSelected, triwulanSelected,regionalSelected);
    }
    useEffect(()=>{
        firstInit()
    },[])

    const fetchData = async(pagination=1, tahun='',triwulan='',regional='',kcu='') => {
        setIsLoading(true)
        const tempParams: QueryParams = {};

        if (tahun && tahun != ""){
            tempParams.tahun = tahun
        }
        if (triwulan && triwulan != ""){
            tempParams.triwulan = triwulan
        }
        if (regional && regional != ""){
            tempParams.id_regional = regional
        }
        if (kcu && kcu != ""){
            tempParams.id_kprk = kcu
        }
        const offset = (pagination - 1) * pageSize
        tempParams.offset = offset.toString()
        tempParams.limit = pageSize.toString()
        const params = buildQueryParam(tempParams) || '';
        if (offset < 0)return
        await getProfilBoLpu(router, params)
        .then((res)=> {
            const { 
                offset,
                limit,
                total_data 
            } = (res.data as any);
            const currentPage:number = Math.floor(offset / limit) + 1;
            const totalPages:number = Math.ceil(total_data / limit);
            const startItem:number = parseInt(offset) + 1;
            const endItem:number = Math.min(parseInt(offset) + parseInt(limit), total_data);
            setPagination({
                currentPage,
                totalPages,
                startItem,
                endItem,
                total_data
            })
            setDataSource(res.data.data)
            setOffset(parseInt((res.data as any).offset) || 0)
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

        if (tahunSelected && tahunSelected != ""){
            tempParams.tahun = tahunSelected
        }
        if (triwulanSelected && triwulanSelected != ""){
            tempParams.triwulan = triwulanSelected
        }
        if (regionalSelected && regionalSelected != ""){
            tempParams.id_regional = regionalSelected
        }
        if (kcuSelected && kcuSelected != ""){
            tempParams.id_kprk = kcuSelected
        }
        const params = buildQueryParam(tempParams) || '';
        await getExportProfilBoLpu(router,params)
            .then((res)=>{
                const url = window.URL.createObjectURL((res.data as any));
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const fileNameParts = [`profil_bo_lpu`];

                if (tahunSelected) {
                    fileNameParts.push(tahunSelected);
                }

                if (triwulanSelected) {
                    fileNameParts.push(triwulanSelected);
                }

                if (regionalSelected) {
                    fileNameParts.push(regionalSelected);
                }

                if (kcuSelected){
                    fileNameParts.push(kcuSelected);
                }

                const fileName = fileNameParts.join('_') + '.xlsx';

                // Setel nama file yang dihasilkan
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                console.log('res export data: ',res);
            })
            .catch((err)=> {
                console.log('res export data error: ',err);
                toast({
                    title: err.message,
                    variant: 'destructive'
                })
            })
            .finally(()=>{
                setIsExportLoading(false)
            })
    }
    const getKcuByRegional = async(id:string|number)=> {
        
        await getKPRKByRegional(router, id)
            .then((res)=>{
                let kcus:Array<any> = res.data.data.map((item:kcuI) => ({
                    value: item.id.toString(),
                    label: item.nama,
                }));
                kcus.unshift({
                  value: '',
                  label: 'Semua KCU'
                })
                setkcuOptions(kcus)
            })
            .catch((err)=>{
                console.log(err);
            })
    }

    const filterByTahun =(value: string)=> {
        setTahunSelected(value)
        setPage(1)
        fetchData(1, value, triwulanSelected,regionalSelected);
    }
    const filterByTriwulan =(value: string)=> {
        setPage(1)
        setTriwulanSelected(value)
        fetchData(1, tahunSelected, value,regionalSelected);
    }
    const filterByRegional =(value: string)=> {
        setPage(1)
        setRegionalSelected(value)
        setKcuSelected('')
        getKcuByRegional(value)
        fetchData(1, tahunSelected, triwulanSelected,value);
    }
    const filterByKcu =(value: string)=> {
        setPage(1)
        setKcuSelected(value)
        fetchData(1, tahunSelected, triwulanSelected,regionalSelected,value);
    }

    return(
        <div className="px-3 lg:px-7 mt-5">
             
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 w-full lg:w-auto">
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
                    <SelectTrigger className="lg:col-start-3">
                    <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectGroup>
                        <SelectItem value={' '}>Semua Tahun</SelectItem>
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
                        <SelectItem value={' '}>Semua Triwulan</SelectItem>
                        {triwulanData.map((t,index)=>(
                        <SelectItem value={t.value} key={index}>{t.label}</SelectItem>
                        ))}
                    </SelectGroup>
                    </SelectContent>
                </Select>
                <div aria-label="Regional Input">
                    <Combobox 
                        value={regionalSelected}
                        options={regionalOptions} 
                        placeholder={"Regional"} 
                        onSelect={filterByRegional}
                    />
                </div>
                <div aria-label="kcu Input">
                    <Combobox 
                        value={kcuSelected}
                        options={kcuOptions} 
                        placeholder={"KCU"} 
                        onSelect={filterByKcu}
                    />
                </div>
            </div>
            <h1 className="text-center my-7 md:my-3 font-bold">Profil BO LPU</h1>
            <div className={`relative overflow-x-scroll`}>
                <table className={style.table}>
                    <thead className="[&:nth-child(3):bg-red-900]">
                        {/* First row of header group */}
                        <tr>
                            <th>No</th>
                            <th>Triwulan</th>
                            <th>Tahun</th>
                            <th>Kode Dirian</th>
                            <th>Regional</th>
                            <th>Nama KC / KCU</th>
                            <th>Nama Kantor POS</th>
                            <th>Alokasi Dana LPU</th>
                        </tr>
                    </thead>
                    <tbody>
                        { dataSource && dataSource.length > 0 ? (dataSource?.map((data,key)=>(
                            <tr key={key}>
                                <td>{offset + key + 1}</td>
                                <td>{data.triwulan}</td>
                                <td>{data.tahun}</td>
                                <td>{data.kode_dirian}</td>
                                <td>{data.nama_regional}</td>
                                <td>{data.nama_kprk}</td>
                                <td>{data.nama_kpc}</td>
                                <td>{data.alokasi_dana_lpu}</td>
                            </tr>
                        ))) : (
                            <tr className="text-center w-full">
                                <td colSpan={11} className="h-24">
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
            <div className="flex lg:flex-row flex-col items-center lg:justify-between py-2 px-2 lg:px-4 rounded-t-md overflow-x-scroll pb-5 mt-2 lg:pb-2">
                <Paginator
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={(pageNumber) => {
                    fetchData(pageNumber)
                    }}
                    showPreviousNext
                    // isLoading={isLoading}
                />
                <div className="pagination-summary text-[9px] lg:text-xs items-center w-full lg:w-auto mt-2 md:mt-0 text-center">
                    Menampilkan <span className="font-bold">{pagination.startItem}-{pagination.endItem}</span> dari <span className="font-bold">{pagination.total_data}</span> item.
                </div>
            </div>
        </div>
    )
}
export default ProfilBoLpu