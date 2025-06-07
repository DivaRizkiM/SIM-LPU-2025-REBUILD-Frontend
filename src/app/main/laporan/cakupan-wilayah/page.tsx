/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { NextPage } from "next";
import style from './index.module.css'
import { Button } from "@/components/ui/button";
import Combobox from "@/components/tools/combobox";
import { useEffect, useState } from "react";
import { FormCustomOption } from "../../../../../store/state";
import { getCakupanWilayah, getExportCakupanWilayah,  getKabKota, getKecamatan, getProvinsi } from "../../../../../services";
import { useRouter } from "next/navigation";
import { CakupanWilayahI, KabKotaI, KecamatanI, ProvinsiI } from "../../../../../services/types";
import { QueryParams, buildQueryParam, isLastPage } from "../../../../../helper";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormField,
    FormItem,
  } from "@/components/ui/form"
import { PaginationI } from "@/lib/types";
import Paginator from "@/components/tools/paginator";


const FormSchema = z.object({
    id_kecamatan: z.string().optional(),
    id_provinsi: z.string().optional(),
    id_kabupaten_kota: z.string().optional(),
  })

const CakupanWilayah:NextPage = ()=>{
    const router = useRouter()
    const [page, setPage] = useState<number>(1);
    const pageSize:number = 10;
    const [offset,setOffset] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [dataSource, setDataSource] = useState<CakupanWilayahI[]>()
    const [isExportLoading,setIsExportLoading] = useState<boolean>(false)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    const [provinsiOptions, setProvinsiOptions] = useState<Array<FormCustomOption>>([])
    const [allKabKota, setAllKabKota] = useState<Array<any>>([])
    const [kabKotaOptions, setKabKotaOptions] = useState<Array<FormCustomOption>>([])
    const [isKotaLoading,setIsKotaLoading] = useState<boolean>(false)
    const [kecamatanOptions, setKecamatanOptions] = useState<Array<FormCustomOption>>([])
    const [isKecamatanLoading,setIsKecamatanLoading] = useState<boolean>(false)

    const [pagination, setPagination] = useState<PaginationI>({
        currentPage: 1,
        totalPages: 0,
        startItem: 0,
        endItem: 0,
        total_data: 0
    })
    
    const firstInit = async()=> {
        setIsLoading(true)
        await Promise.all([
            getProvinsi(router,'?limit=999'),
            getKabKota(router,'?limit=9999'),
        ])
        .then((responses)=>{
            const [province,kab_kota] = responses
            
            const provinces = province.data.data.map((item:ProvinsiI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            setProvinsiOptions(provinces)
            setAllKabKota(kab_kota.data.data)
            fetchData(page, form.getValues('id_provinsi'), form.getValues('id_kabupaten_kota'),form.getValues('id_kecamatan'));
        
        })
        .catch((err)=>{
            console.log('Err: ',err);
        })
        .finally(()=>{
          setIsLoading(false)
        })
      }
        useEffect(()=>{
        firstInit()
    },[])

    const fetchData = async(pagination=1, id_provinsi='',id_kabupaten_kota='',id_kecamatan='') => {
        setIsLoading(true)
        const tempParams: QueryParams = {};
        
        if (id_provinsi && id_provinsi != " "){
            tempParams.id_provinsi = id_provinsi
        }
        if (id_kabupaten_kota && id_kabupaten_kota != " "){
            tempParams.id_kabupaten_kota = id_kabupaten_kota
        }
        if (id_kecamatan && id_kecamatan != " "){
            tempParams.id_kecamatan = id_kecamatan
        }
        const offset = (pagination - 1) * pageSize
        tempParams.offset = offset.toString()
        tempParams.limit = pageSize.toString()
        const params = buildQueryParam(tempParams) || '';
        if (offset < 0)return
        await getCakupanWilayah(router, params)
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

    const exportData = async(dataForm: z.infer<typeof FormSchema>)=>{
        setIsExportLoading(true)
        const tempParams: QueryParams = {};
        if (dataForm.id_provinsi && dataForm.id_provinsi != " "){
            tempParams.id_provinsi = dataForm.id_provinsi
        }
        if (dataForm.id_kabupaten_kota && dataForm.id_kabupaten_kota != " "){
            tempParams.id_kabupaten_kota = dataForm.id_kabupaten_kota
        }
        if (dataForm.id_kecamatan && dataForm.id_kecamatan != " "){
            tempParams.id_kecamatan = dataForm.id_kecamatan
        }

        const params = buildQueryParam(tempParams) || '';
        await getExportCakupanWilayah(router,params)
            .then((res)=>{
                const url = window.URL.createObjectURL((res.data as any));
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const fileNameParts = [`cakupan_wilayah`];

                const fileName = fileNameParts.join('_') + '.xlsx';

                // Setel nama file yang dihasilkan
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
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
    const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
        await fetchData(page, dataForm.id_provinsi, dataForm.id_kabupaten_kota,dataForm.id_kecamatan)
    }
    const getKotaByProvince = (id:string|number, DataAllKabKota:Array<any>=allKabKota)=> {
        setIsKotaLoading(true)
        if(form.getValues('id_kecamatan')){
            form.setValue('id_kecamatan','')
        }
        if(form.getValues('id_kabupaten_kota')){
            form.setValue('id_kabupaten_kota','')
        }
        try {
            const kotaYangCocok:KabKotaI[] = DataAllKabKota.filter((item:KabKotaI) => item.id_provinsi.toString() === id.toString());
            const kotaFiltered = kotaYangCocok.map((item:KabKotaI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            
            setKabKotaOptions(kotaFiltered)
            form.setValue('id_kabupaten_kota','')
        } catch (error) {
            console.log('Err: ',error);   
        } finally {
            setTimeout(()=>{
              setIsKotaLoading(false)
            },500)
        }   
    }
    const getKecamatanByKota = async(id_kabupaten_kota:string)=>{
        setIsKecamatanLoading(true)
        try {
            const payload = '?id_kabupaten_kota='+id_kabupaten_kota
            const response = await getKecamatan(router,payload)
            const kecamatanFiltered = response.data.data.map((item:KecamatanI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            setKecamatanOptions(kecamatanFiltered)
        } catch (error:any) {
            console.log('Err: ',error);
            
            toast({
                title: error?.message || 'Something Wrong...'
            })
        } finally {
            setIsKecamatanLoading(false)
        }
    }
    const handleNextClick = () => {
        setPage(page+1)
        fetchData(page + 1, form.getValues('id_provinsi'), form.getValues('id_kabupaten_kota'),form.getValues('id_kecamatan'));
    };
    const handlePreviousClick = () => {
        setPage(page-1)
        fetchData(page - 1, form.getValues('id_provinsi'), form.getValues('id_kabupaten_kota'),form.getValues('id_kecamatan'));
    };

    return(
        <div className="px-3 lg:px-7 mt-5">
             
            <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(exportData)} className="grid lg:grid-cols-3 gap-3">
                    <Button className="">
                        {isExportLoading ? (
                            <Loader2 className="me-2 h-4 w-4 animate-spin"/>
                        ):(
                            <Download className="me-2 w-4 h-4"/> 
                        )}
                        Export Excel
                    </Button>
                        <FormField
                        control={form.control}
                        name="id_provinsi"
                        render={({ field }) => (
                            <FormItem>
                            <Combobox 
                                options={provinsiOptions}
                                placeholder="Pilih Provinsi"
                                value={field.value}
                                onSelect={(e)=>{
                                    form.setValue("id_provinsi",e)
                                    getKotaByProvince(e)
                                    fetchData(page, e, form.getValues('id_kabupaten_kota'),form.getValues('id_kecamatan'));
                                }}
                                // isLoading={isRegionalLoading}
                                disabled={provinsiOptions.length === 0}
                            />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="id_kabupaten_kota"
                        render={({ field }) => (
                            <FormItem>
                            <Combobox 
                                options={kabKotaOptions}
                                placeholder="Pilih Kab/Kota"
                                value={field.value}
                                onSelect={(e)=>{
                                    form.setValue('id_kabupaten_kota',e)
                                    getKecamatanByKota(e)
                                    fetchData(page, form.getValues('id_provinsi'), e,form.getValues('id_kecamatan'));
                                }}
                                isLoading={isKotaLoading}
                                disabled={kabKotaOptions.length === 0 || isKotaLoading}
                            />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="id_kecamatan"
                        render={({ field }) => (
                            <FormItem>
                            <Combobox 
                                options={kecamatanOptions}
                                placeholder="Pilih Kecamatan"
                                value={field.value}
                                onSelect={(e)=>{
                                    form.setValue('id_kecamatan',e)
                                    fetchData(page, form.getValues('id_provinsi'), form.getValues('id_kabupaten_kota'),e);
                                }}
                                isLoading={isKecamatanLoading}
                                disabled={kecamatanOptions.length === 0 || isKecamatanLoading}
                            />
                            </FormItem>
                        )}
                        />
                    </form>
                </Form>
            </div>
            <h1 className="text-center my-7 md:my-3 font-bold">Cakupan Wilayah</h1>
            <div className={`relative overflow-x-scroll`}>
                <table className={style.table}>
                    <thead className="[&:nth-child(3):bg-red-900]">
                        {/* First row of header group */}
                        <tr>
                            <th rowSpan={2}>No</th>
                            <th rowSpan={2}>Provinsi</th>
                            <th rowSpan={2}>Kabupaten/Kota</th>
                            <th rowSpan={2}>Kecamatan</th>
                            <th rowSpan={2}>Kelurahan</th>
                            <th colSpan={2}>Nama Penyelenggara</th>
                        </tr>
                        {/* Second row of header group */}
                        <tr>
                            <th>JNT</th>
                            <th>SICEPAT</th>
                        </tr>
                    </thead>
                    <tbody>
                        { dataSource && dataSource.length > 0 ? (dataSource?.map((data,key)=>(
                            <tr key={key}>
                                <td>{offset + key + 1}</td>
                                <td>{data.nama_provinsi}</td>
                                <td>{data.nama_kabupaten}</td>
                                <td>{data.nama_kecamatan}</td>
                                <td>{data.nama_kelurahan}</td>
                                <td>{data.JNT}</td>
                                <td>{data.SICEPAT}</td>
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
export default CakupanWilayah