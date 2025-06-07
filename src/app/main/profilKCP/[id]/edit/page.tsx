"use client"
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReloadIcon } from "@radix-ui/react-icons";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getKPRKByRegional, getProvinsi, getRegional, getDetailKpc, getKabKota, getKecamatan, getKelurahan, postKpc } from "../../../../../../services";
import { useParams, useRouter } from "next/navigation";
import { FormCustomOption } from "../../../../../../store/state";
import { RegionalI } from "../../../referensi/regional/columns";
import Combobox from "@/components/tools/combobox";
import { z } from "zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { kcuI } from "../../../referensi/kc-kcu/columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { KecamatanI } from "@/app/main/referensi/kecamatan/columns";
import { KabKotaI } from "@/app/main/referensi/kabupaten-kota/columns";
import { KelurahanI } from "@/app/main/referensi/kelurahan/columns";
import { IDetailKpc } from "../../../../../../services/types";
import { splitTimeRangeString } from "../../../../../../helper";

const FormSchema = z.object({
    id_regional: z.string(),
    id_kprk: z.string(),
    nomor_dirian: z.string(),
    nama: z.string(),
    jenis_kantor: z.string(),
    alamat: z.string(),
    koordinat_longitude: z.string({required_error: 'Longitude tidak boleh kosong'}),
    koordinat_latitude: z.string({required_error: 'Latitude tidak boleh kosong'}), 
    nomor_telpon: z.string(),
    nomor_fax: z.string(),
    id_provinsi: z.string(),
    id_kabupaten_kota: z.string(),
    id_kecamatan: z.string(),
    id_kelurahan: z.string(),
    tipe_kantor: z.string(),
    jam_kerja_senin_kamis: z.object({
        dari: z.string(),
        sampai: z.string()
    }),
    jam_kerja_jumat: z.object({
        dari: z.string(),
        sampai: z.string()
    }),
    jam_kerja_sabtu: z.object({
        dari: z.string(),
        sampai: z.string()
    }).nullable(),
    frekuensi_antar_ke_alamat: z.string(),
    frekuensi_antar_ke_dari_kprk: z.string(),
    jumlah_tenaga_kontrak: z.string(),
    kondisi_gedung: z.string(),
    fasilitas_publik_dalam: z.string(),
    fasilitas_publik_halaman: z.string(),
    lingkungan_kantor: z.string(),
    lingkungan_sekitar_kantor: z.string(),
    tgl_sinkronisasi: z.string(),
    // id_user: z.number(),
    tgl_update: z.string().nullable(),
    id_file: z.any(),
    qr_code: z.any()
  })

const EditPage:NextPage = ()=> {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [regionalOptions, setRegionalOptions] = useState<Array<FormCustomOption>>([])
    const [isRegionalLoading,setIsRegionalLoading] = useState<boolean>(false)
    const [kcuOptions,setKcuOptions] = useState<Array<FormCustomOption>>([])
    const [isKcuLoading,setIsKcuLoading] = useState<boolean>(false)
    const [provinsiOptions, setProvinsiOptions] = useState<Array<FormCustomOption>>([])
    const [kabKotaOptions, setKabKotaOptions] = useState<Array<FormCustomOption>>([])
    const [isKabKotaLoading, setIsKabKotaLoading] = useState<boolean>(false)
    const [kecamatanOptions, setKecamatanOptions] = useState<Array<FormCustomOption>>([])
    const [iskecamatanLoading, setIskecamatanLoading] = useState<boolean>(false)
    const [kelurahanOptions, setKelurahanOptions] = useState<Array<FormCustomOption>>([])
    const [iskelurahanLoading, setIskelurahanLoading] = useState<boolean>(false)
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    
    const params = useParams<{ id: string }>()

    const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
        setIsSubmitting(true)
        
        await postKpc(router,dataForm)
        .then((res)=>{
            toast({
                title: 'Berhasil mengubah profil KPC!'
            })
        })
        .catch((err)=> {
            console.log('Err: ',err);
            
            toast({
                title: err?.message || 'Terdapat kesalahan',
                variant: 'destructive'
            })
        })
        .finally(()=>{
            setIsSubmitting(false)
        })

    }

    const firstInit = async()=> {
        setIsRegionalLoading(true)
        await Promise.all([
            getRegional(router,'?limit=99'),
            getProvinsi(router,'?limit=99'),
            getDetailKpc(router,params.id)
        ])
        .then((responses)=>{
            let regionals:Array<any> = responses[0].data.data.map((item:RegionalI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            setRegionalOptions(regionals)
            let provinces:Array<any> = responses[1].data.data.map((item:RegionalI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            setProvinsiOptions(provinces)
            const kpcDetails:IDetailKpc = responses[2].data.data
            
            if (kpcDetails){
                getKcuByRegional(kpcDetails.id_regional?.toString())
                getAllRegionsByProvince(kpcDetails.id_provinsi)
    
                form.setValue('alamat',kpcDetails.alamat)
                form.setValue('fasilitas_publik_dalam',kpcDetails.fasilitas_publik_dalam)
                form.setValue('fasilitas_publik_halaman',kpcDetails.fasilitas_publik_halaman)
                form.setValue('frekuensi_antar_ke_alamat',kpcDetails.frekuensi_antar_ke_alamat)
                form.setValue('frekuensi_antar_ke_dari_kprk',kpcDetails.frekuensi_antar_ke_dari_kprk)
                form.setValue('id_file',kpcDetails.id_file)
                form.setValue('id_kabupaten_kota',kpcDetails.id_kabupaten_kota)
                form.setValue('id_kprk',kpcDetails.id_kprk.toString())
                form.setValue('id_provinsi',kpcDetails.id_provinsi)
                form.setValue('id_kecamatan',kpcDetails.id_kecamatan)
                form.setValue('id_kelurahan',kpcDetails.id_kelurahan)
                form.setValue('id_regional',kpcDetails.id_regional.toString())
                // form.setValue('id_user',kpcDetails.id_user)
                form.setValue('jenis_kantor',kpcDetails.jenis_kantor)
                form.setValue('jumlah_tenaga_kontrak',kpcDetails.jumlah_tenaga_kontrak)
                form.setValue('kondisi_gedung',kpcDetails.kondisi_gedung)
                form.setValue('koordinat_latitude',kpcDetails.koordinat_latitude)
                form.setValue('koordinat_longitude',kpcDetails.koordinat_longitude)
                form.setValue('lingkungan_kantor',kpcDetails.lingkungan_kantor)
                form.setValue('lingkungan_sekitar_kantor',kpcDetails.lingkungan_sekitar_kantor)
                form.setValue('nama',kpcDetails.nama)
                form.setValue('nomor_dirian',kpcDetails.nomor_dirian)
                form.setValue('nomor_fax',kpcDetails.nomor_fax)
                form.setValue('nomor_telpon',kpcDetails.nomor_telpon)
                form.setValue('qr_code',kpcDetails.qr_code)
                form.setValue('tgl_sinkronisasi',kpcDetails.tgl_sinkronisasi)
                form.setValue('tgl_update',kpcDetails.tgl_update)
                form.setValue('tipe_kantor',kpcDetails.tipe_kantor)
                

                form.setValue('jam_kerja_jumat.dari',splitTimeRangeString(kpcDetails.jam_kerja_jumat)[0])
                form.setValue('jam_kerja_jumat.sampai',splitTimeRangeString(kpcDetails.jam_kerja_jumat)[1])
                form.setValue('jam_kerja_sabtu.dari',splitTimeRangeString(kpcDetails.jam_kerja_sabtu)[0])
                form.setValue('jam_kerja_sabtu.sampai',splitTimeRangeString(kpcDetails.jam_kerja_sabtu)[1])
                form.setValue('jam_kerja_senin_kamis.dari',splitTimeRangeString(kpcDetails.jam_kerja_senin_kamis)[0])
                form.setValue('jam_kerja_senin_kamis.sampai',splitTimeRangeString(kpcDetails.jam_kerja_senin_kamis)[1])
            }
        })
        .catch((err)=> {
            console.log('Err: ',err);
            toast({
                title: err.message,
                variant: 'destructive'
            })
        })
        .finally(()=>{
            setIsRegionalLoading(false)
        })
        
         
    }
    useEffect(()=>{
        if (params.id.length > 0){
            firstInit()
        }
        /* eslint-disable react-hooks/exhaustive-deps */
    },[])

    const getKcuByRegional = async(id:string|number)=> {
        setIsKcuLoading(true)
        try {
            if (form.getValues('id_kprk')){
                form.setValue('id_kprk','')
            }
            const res = await getKPRKByRegional(router,id)
            if (res.status === 200){
                const kcus = res.data.data
                const cleanedKCU = kcus.map((item:kcuI)=> ({
                    value: item.id.toString(),
                    label: item.nama
                }))
                setKcuOptions(cleanedKCU)
            }
        } catch (error) {
            console.log('Err: ',error);
       } finally {
        setTimeout(()=>{
            setIsKcuLoading(false)
        },500)
       }
    }

    const getAllRegionsByProvince = async(id: string)=> {
        setIsKabKotaLoading(true)
        await Promise.all([
            getKabKota(router,`?id_provinsi=${id}&limit=999`),
            getKecamatan(router,`?id_provinsi=${id}&limit=9999`),
            getKelurahan(router, `?id_provinsi=${id}&limit=9999`)
        ])
        .then((responses)=>{
            let kotaFiltered:Array<any> = responses[0].data.data.map((item:KabKotaI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            setKabKotaOptions(kotaFiltered)

            let kecamatanFiltered:Array<any> = responses[1].data.data.map((item:KecamatanI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            setKecamatanOptions(kecamatanFiltered)

            let kelurahanFiltered:Array<any> = responses[2].data.data.map((item:KelurahanI) => ({
                value: item.id.toString(),
                label: item.nama
            }));
            
            setKelurahanOptions(kelurahanFiltered)
        })
        .catch((error)=> {
            console.log('Err: ',error);
            toast({
                title: error?.message,
                variant: 'destructive'
            })
        })
        .finally(()=>{
            setTimeout(()=>{
                setIsKabKotaLoading(false)
            },350)
        })
    }

    const onProvinceChange = (val:string,field:ControllerRenderProps<any, any>)=>{
        field.onChange(val)
        return getAllRegionsByProvince(val)
    }

    
    return(
        <div className="relative h-full">
            <h3 className="px-2 md:px-4 py-1 md:py-2 scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
                Edit Profil KCP
            </h3>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="form_update_kcp" className="px-2 md:px-4 py-1 md:py-2 pb-[100px] relative">
                <div className="grid md:grid-cols-2 md:gap-7">
                    <div className="space-y-3">
                        <FormField
                        control={form.control}
                        name="id_regional"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Regional</FormLabel>
                                <Combobox 
                                // value={(field.value as string) ?? ''}
                                value={field.value}
                                options={regionalOptions} 
                                placeholder={"Regional"} 
                                onSelect={(value:string)=> {
                                    form.setValue('id_regional',value)
                                    return getKcuByRegional(value)
                                }}
                                isLoading={isRegionalLoading}
                                disabled={regionalOptions.length === 0 || isKcuLoading}
                            />
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="id_kprk"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>KC/KCU</FormLabel>
                                <Combobox 
                                // value={(field.value as string) ?? ''}
                                value={field.value}
                                options={kcuOptions} 
                                placeholder={"Pilih KC/KCU"} 
                                onSelect={(value:string)=> {
                                    form.setValue('id_kprk',value)
                                }}
                                disabled={kcuOptions.length === 0 || isKcuLoading}
                                isLoading={isKcuLoading}
                            />
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="nomor_dirian"
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Nomor Dirian</FormLabel>
                                <Input placeholder="Masukkan nomor dirian" {...field}/>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='nama'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Nama Kantor Pos</FormLabel>
                                <Input placeholder="Masukkan nama kantor pos" {...field}/>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='qr_code'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Gambar QR Code</FormLabel>
                                <Input type="file" {...field}/>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='jenis_kantor'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Jenis Kantor</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Pilih jenis kantor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">KPC LPK</SelectItem>
                                        <SelectItem value="2">KPC LPU</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='alamat'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Alamat</FormLabel>
                                <Textarea placeholder="Masukkan alamat" {...field} rows={4}/>
                            </FormItem>
                        )}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <FormField
                            control={form.control}
                            name='koordinat_latitude'
                            render={({field})=> (
                                <FormItem>
                                    <FormLabel>Koordinat Latitude</FormLabel>
                                    <Input placeholder="ex: 40.753" {...field}/>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name='koordinat_longitude'
                            render={({field})=> (
                                <FormItem>
                                    <FormLabel>Koordinat Longitude</FormLabel>
                                    <Input placeholder="ex: -73.983" {...field}/>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                        <FormField
                        control={form.control}
                        name='nomor_telpon'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Nomor Telepon</FormLabel>
                                <Input type="tel" placeholder="Masukkan nomor telepon" {...field}/>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='nomor_fax'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Nomor Fax</FormLabel>
                                <Input placeholder="Masukkan nomor Fax" {...field}/>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="id_provinsi"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Provinsi</FormLabel>
                                <Combobox 
                                    options={provinsiOptions}
                                    placeholder="Pilih Provinsi"
                                    value={field.value}
                                    onSelect={(val)=>{
                                        onProvinceChange(val,field)
                                    }}
                                    disabled={provinsiOptions.length === 0}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="id_kabupaten_kota"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kab/Kota</FormLabel>
                                <Combobox 
                                    options={kabKotaOptions}
                                    placeholder="Pilih Kab/Kota"
                                    value={field.value}
                                    onSelect={field.onChange}
                                    disabled={kabKotaOptions.length === 0  || isKabKotaLoading}
                                    isLoading={isKabKotaLoading}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='id_kecamatan'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kecamatan</FormLabel>
                                <Combobox 
                                    options={kecamatanOptions}
                                    placeholder="Pilih Kecamatan"
                                    value={field.value}
                                    onSelect={field.onChange}
                                    disabled={kecamatanOptions.length === 0}
                                    
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="id_kelurahan"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kelurahan</FormLabel>
                                <Combobox 
                                    options={kelurahanOptions}
                                    placeholder="Pilih Kelurahan"
                                    value={field.value}
                                    onSelect={field.onChange}
                                    disabled={kelurahanOptions.length === 0}
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="space-y-3">
                        <FormField
                        control={form.control}
                        name='tipe_kantor'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Tipe Kantor</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Pilih tipe kantor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Investasi</SelectItem>
                                        <SelectItem value="2">Pelita</SelectItem>
                                        <SelectItem value="3">Sewa</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="jam_kerja_senin_kamis"
                        render={()=> (
                            <FormItem>
                                <FormLabel>Jam Kerja Senin - Kamis</FormLabel>
                                <div className="flex items-center space-x-4 md:space-x-6">
                                    <Input 
                                        defaultValue={form.getValues('jam_kerja_senin_kamis.dari')}
                                        type="time"
                                        onChange={(e)=> {
                                            form.setValue('jam_kerja_senin_kamis.dari',e.currentTarget.value)}
                                        }
                                    />
                                    <span> s/d </span>
                                    <Input 
                                     type="time" 
                                     defaultValue={form.getValues('jam_kerja_senin_kamis.sampai')}
                                     onChange={(e)=> {
                                         form.setValue('jam_kerja_senin_kamis.sampai',e.currentTarget.value)}
                                     }
                                 />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='jam_kerja_jumat'
                        render={()=> (
                            <FormItem>
                                <FormLabel>Jam Kerja Jum&apos;at</FormLabel>
                                <div className="flex items-center space-x-4 md:space-x-6">
                                    <Input 
                                        type="time" 
                                        defaultValue={form.getValues('jam_kerja_jumat.dari')}
                                        onChange={(e)=> {
                                            form.setValue('jam_kerja_jumat.dari',e.currentTarget.value)}
                                        }
                                    />
                                    <span> s/d </span>
                                    <Input 
                                     type="time" 
                                     defaultValue={form.getValues('jam_kerja_jumat.sampai')}
                                     onChange={(e)=> {
                                         form.setValue('jam_kerja_jumat.sampai',e.currentTarget.value)}
                                     }
                                 />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='jam_kerja_sabtu'
                        render={()=> (
                            <FormItem>
                                <FormLabel>Jam Kerja Sabtu</FormLabel>
                                <div className="flex items-center space-x-4 md:space-x-6">
                                    <Input 
                                        type="time" 
                                        defaultValue={form.getValues('jam_kerja_sabtu.dari')}
                                        onChange={(e)=> {
                                            form.setValue('jam_kerja_sabtu.dari',e.currentTarget.value)}
                                        }
                                    />
                                    <span> s/d </span>
                                    <Input 
                                     type="time" 
                                     defaultValue={form.getValues('jam_kerja_sabtu.sampai')}
                                     onChange={(e)=> {
                                         form.setValue('jam_kerja_sabtu.sampai',e.currentTarget.value)}
                                     }
                                 />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="frekuensi_antar_ke_alamat"
                            render={({field})=> (
                                <FormItem>
                                    <FormLabel>Frekuensi Antar Ke Alamat</FormLabel>
                                    <div className='flex'>
                                        <Input 
                                        type='number' className="rounded-none" {...field}/>
                                        <div className='bg-secondary w-48 flex items-center justify-center -z-10 text-sm'>
                                            x sehari
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='frekuensi_antar_ke_dari_kprk'
                            render={({field})=> (
                                <FormItem>
                                    <FormLabel>Frekuensi Antar Ke Dari Kprk</FormLabel>
                                    <div className='flex'>
                                        <Input type='number' className="rounded-none" {...field}/>
                                        <div className='bg-secondary w-48 flex items-center justify-center -z-10 text-sm'>
                                            x seminggu
                                        </div>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='jumlah_tenaga_kontrak'
                            render={({field})=> (
                                <FormItem>
                                    <FormLabel>Jumlah Tenaga Kontrak</FormLabel>
                                    <div className='flex'>
                                        <Input type='number' className="rounded-none" {...field}/>
                                        <div className='bg-secondary w-48 flex items-center justify-center -z-10 text-sm'>
                                            x seminggu
                                        </div>
                                    </div>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                        control={form.control}
                        name='kondisi_gedung'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Kondisi Gedung</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Baik">Baik</SelectItem>
                                        <SelectItem value="Sedang">Sedang</SelectItem>
                                        <SelectItem value="Kurang">Kurang</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="fasilitas_publik_dalam"
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Fasilitas Publik Dalam Kantor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Luas">Luas</SelectItem>
                                        <SelectItem value="Cukup">Cukup</SelectItem>
                                        <SelectItem value="Kurang">Kurang</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="fasilitas_publik_halaman"
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Fasilitas Publik Halaman Kantor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Luas">Luas</SelectItem>
                                        <SelectItem value="Cukup">Cukup</SelectItem>
                                        <SelectItem value="Kurang">Kurang</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='lingkungan_kantor'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Fasilitas Lingkungan Kantor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Ramai">Ramai</SelectItem>
                                        <SelectItem value="Sedang">Sedang</SelectItem>
                                        <SelectItem value="Sepi">Sepi</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name='lingkungan_sekitar_kantor'
                        render={({field})=> (
                            <FormItem>
                                <FormLabel>Fasilitas Lingkungan Sekitar Kantor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Pilih" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pasar">Pasar</SelectItem>
                                        <SelectItem value="Pemukiman">Pemukiman</SelectItem>
                                        <SelectItem value="Pertokoan">Pertokoan</SelectItem>
                                        <SelectItem value="Perkantoran">Perkantoran</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
            </form>
            </Form>
            <div className="sticky bottom-0 left-0 right-0 space-x-2 md:space-x-5 flex justify-end items-center p-3 pe-8 bg-gradient-to-r from-cyan-500/40 to-blue-500/20">
                <Link
                    href={`../`} 
                    className={cn(
                        buttonVariants({variant: 'outline',size: 'lg'})
                    )}
                >
                    Kembali
                </Link>
                <Button className="text-white" onClick={form.handleSubmit(onSubmit)} size='lg'>
                    {isSubmitting && (
                        <ReloadIcon className="mr-2 h-3 w-3 animate-spin"/>
                    )}
                    Simpan
                </Button>
            </div>
        </div>
    )
}

export default EditPage