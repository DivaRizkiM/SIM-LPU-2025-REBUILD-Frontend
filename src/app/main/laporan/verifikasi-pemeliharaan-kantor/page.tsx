'use client'
import { NextPage } from "next";
import style from './index.module.css'
import { Button } from "@/components/ui/button";
import Combobox from "@/components/tools/combobox";
import { useEffect, useState } from "react";
import { FormCustomOption } from "../../../../../store/state";
import { getExportVerifikasiPemeliharaanKantor, getKabKota, getKecamatan, getKelurahan, getVerifikasiPemeliharaanKantor, getProvinsi } from "../../../../../services";
import { useRouter } from "next/navigation";
import { KabKotaI, KecamatanI, KelurahanI, VerifikasiPemeliharaanKantorI, ProvinsiI } from "../../../../../services/types";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import yearsData from '@/lib/years.json'
import months from '@/lib/months.json'
import { PaginationI } from "@/lib/types";
import Paginator from "@/components/tools/paginator";

const FormSchema = z.object({
    id_kecamatan: z.string().optional(),
    id_provinsi: z.string().optional(),
    id_kabupaten_kota: z.string().optional(),
    id_kelurahan: z.string().optional(),
    tahun: z.string().optional(),
    bulan: z.string().optional(),
})

const VerifikasiPemeliharaanKantor:NextPage = ()=>{
    const router = useRouter()
    const [page, setPage] = useState<number>(1);
    const pageSize:number = 10;
    const [offset,setOffset] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [dataSource, setDataSource] = useState<VerifikasiPemeliharaanKantorI[]>()
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
    const [kelurahanOptions, setKelurahanOptions] = useState<Array<FormCustomOption>>([])
    const [isKelurahanLoading,setIsKelurahanLoading] = useState<boolean>(false)

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
        /* eslint-disable react-hooks/exhaustive-deps */
    },[])

    const fetchData = async(pagination=1, id_provinsi='',id_kabupaten_kota='',id_kecamatan='',id_kelurahan='',tahun='',bulan='') => {
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
        if (id_kelurahan && id_kelurahan != " "){
            tempParams.id_kelurahan = id_kelurahan
        }
        if (tahun && tahun != " "){
            tempParams.tahun = tahun
        }
        if (bulan && bulan != " "){
            tempParams.bulan = bulan
        }
        const offset = (pagination - 1) * pageSize
        tempParams.offset = offset.toString()
        tempParams.limit = pageSize.toString()
        const params = buildQueryParam(tempParams) || '';
        if (offset < 0)return
        await getVerifikasiPemeliharaanKantor(router, params)
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
        if (dataForm.id_kelurahan && dataForm.id_kelurahan != " "){
            tempParams.id_kelurahan = dataForm.id_kelurahan
        }
        if (dataForm.tahun && dataForm.tahun != " "){
            tempParams.tahun = dataForm.tahun
        }
        if (dataForm.bulan && dataForm.bulan != " "){
            tempParams.bulan = dataForm.bulan
        }

        const params = buildQueryParam(tempParams) || '';
        await getExportVerifikasiPemeliharaanKantor(router,params)
            .then((res)=>{
                const url = window.URL.createObjectURL((res.data as any));
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const fileNameParts = [`perbaikan_ringan`];

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
    const getKelurahanByKecamatan = async(id_kecamatan:string)=>{
        setIsKecamatanLoading(true)
        try {
            const payload = '?id_kecamatan='+id_kecamatan
            const response = await getKelurahan(router,payload)
            const kelurahanFiltered = response.data.data.map((item:KelurahanI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            setKelurahanOptions(kelurahanFiltered)
        } catch (error:any) {
            console.log('Err: ',error);
            
            toast({
                title: error?.message || 'Something Wrong...'
            })
        } finally {
            setIsKecamatanLoading(false)
        }
    }

    return(
        <div className="px-3 lg:px-7 mt-5">
             
             <Form {...form}>
                <form onSubmit={form.handleSubmit(exportData)} className="grid lg:grid-cols-3 gap-3">
                    <Button 
                        className="" 
                        type="submit" 
                    >
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
                                fetchData(page, e, form.getValues('id_kabupaten_kota'),form.getValues('id_kecamatan'),form.getValues('tahun'),form.getValues('bulan'));
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
                                fetchData(page, form.getValues('id_provinsi'), e,form.getValues('id_kecamatan'),form.getValues('tahun'),form.getValues('bulan'));
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
                                getKelurahanByKecamatan(e)
                                fetchData(page, form.getValues('id_provinsi'), form.getValues('id_kabupaten_kota'),e,form.getValues('tahun'),form.getValues('bulan'));
                            }}
                            isLoading={isKecamatanLoading}
                            disabled={kecamatanOptions.length === 0 || isKecamatanLoading}
                        />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="id_kelurahan"
                    render={({ field }) => (
                        <FormItem>
                        <Combobox 
                            options={kelurahanOptions}
                            placeholder="Pilih Kelurahan"
                            value={field.value}
                            onSelect={(e)=>{
                                form.setValue('id_kelurahan',e)
                                fetchData(page, form.getValues('id_provinsi'), form.getValues('id_kabupaten_kota'),form.getValues('id_kecamatan'),e,form.getValues('tahun'),form.getValues('bulan'));
                            }}
                            isLoading={isKelurahanLoading}
                            disabled={kelurahanOptions.length === 0 || isKecamatanLoading}
                        />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="tahun"
                    render={({ field }) => (
                        <FormItem>
                            <Select 
                                onValueChange={(value)=>{
                                    field.onChange(value)
                                    fetchData(page, form.getValues('id_provinsi'), form.getValues('id_kabupaten_kota'),form.getValues('id_kecamatan'),form.getValues('id_kelurahan'),value,form.getValues('bulan'));
                                }} 
                                value={field.value}
                            >
                                <SelectTrigger id="area">
                                    <SelectValue placeholder="Pilih tahun" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={' '}>Semua Tahun</SelectItem>
                                    {yearsData.map((year,key)=>(
                                        <SelectItem key={key} value={year.value}>{year.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="bulan"
                    render={({ field }) => (
                        <FormItem>
                            <Select 
                                onValueChange={(value)=>{
                                    field.onChange(value)
                                    fetchData(page, form.getValues('id_provinsi'), form.getValues('id_kabupaten_kota'),form.getValues('id_kecamatan'),form.getValues('id_kelurahan'),form.getValues('tahun'),value);
                                }} 
                                value={field.value}
                            >
                                <SelectTrigger id="area">
                                    <SelectValue placeholder="Pilih bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value={' '}>Semua Bulan</SelectItem>
                                    {months.map((month,key)=>(
                                        <SelectItem key={key} value={month.value}>{month.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                    />
                </form>
            </Form>
            <h1 className="text-center my-7 md:my-3 font-bold">Verifikasi Pemeliharaan Kantor</h1>
            <div className={`relative overflow-x-scroll`}>
                <table className={style.table}>
                    <thead className="[&:nth-child(3):bg-red-900]">
                        {/* First row of header group */}
                        <tr>
                            <th rowSpan={2}>No</th>
                            <th rowSpan={2}>Tanggal</th>
                            <th rowSpan={2}>Petugas</th>
                            <th rowSpan={2}>Kode POS</th>
                            <th rowSpan={2}>Kantor LPU</th>
                            <th rowSpan={2}>Provinsi</th>
                            <th rowSpan={2}>Kabupaten/Kota</th>
                            <th rowSpan={2}>Kecamatan</th>
                            <th rowSpan={2}>Desa</th>
                            <th rowSpan={2}>Hasil Verifikasi</th>
                            <th rowSpan={2}>Uraian</th>
                        </tr>
                    </thead>
                    <tbody>
                        { dataSource && dataSource.length > 0 ? (dataSource?.map((data,key)=>(
                            <tr key={key}>
                               <td>{offset + key + 1}</td>
                                <td>{data.tanggal}</td>
                                <td>
                                    {data.petugas_list.map((data,key)=>(
                                        <span key={key}>{data.nama_petugas},</span>
                                    ))}
                                </td>
                                <td>{data.kode_pos}</td>
                                <td>{data.kantor_lpu}</td>
                                <td>{data.provinsi}</td>
                                <td>{data.kabupaten}</td>
                                <td>{data.kecamatan}</td>
                                <td>{data.kelurahan}</td>
                                <td>{data.hasil_verifikasi}</td>
                                <td className="text-sm">{data.kesimpulan}</td>
                            </tr>
                        ))) : (
                            <tr className="text-center w-full">
                                <td colSpan={15} className="h-24">
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
export default VerifikasiPemeliharaanKantor