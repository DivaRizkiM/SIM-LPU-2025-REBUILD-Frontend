"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { destroyDrawerModal, stringifyError } from "../../../../../../helper"
import { context } from "../../../../../../store"
import { getKabKota, getProvinsi, postKecamatan, putKecamatan } from "../../../../../../services"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import Combobox from "@/components/tools/combobox"
import { FormCustomOption } from "../../../../../../store/state"
import { KabKotaI } from "../../kabupaten-kota/columns"
import { KecamatanI } from "../columns"
import { ProvinsiI } from "../../provinsi/columns"

const FormSchema = z.object({
  // kodeProvinsi: z.string({required_error: 'Kode Provinsi tidak boleh kosong'}),
  nama: z.string({required_error: 'Nama Kecamatan tidak boleh kosong'}).min(1, {
    message: "Nama Kecamatan harus lebih dari 1 karakter.",
  }),
  id_provinsi: z.string({required_error: 'Nama Provinsi tidak boleh kosong'}).min(1, {
    message: "Nama Provinsi harus lebih dari 1 karakter.",
  }),
  id_kabupaten_kota: z.string({required_error: 'Nama Kab/Kota tidak boleh kosong'}).min(1, {
    message: "Nama Kab/Kota harus lebih dari 1 karakter.",
  }),
})

interface FromDataI {
  trigger: ()=>void
  data?: KecamatanI
}
const FormData:FC<FromDataI> = ({ trigger,data })=> {
  const ctx = context()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [provinsiOptions, setProvinsiOptions] = useState<Array<FormCustomOption>>([])
  const [allKabKota, setAllKabKota] = useState<Array<any>>([])
  const [kabKotaOptions, setKabKotaOptions] = useState<Array<FormCustomOption>>([])
  const [isKotaLoading,setIsKotaLoading] = useState<boolean>(false)
  

  const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
    setIsLoading(true)
    if (!data){
      await postKecamatan(router,dataForm)
      .then((res)=>{
        toast({
          title: `Berhasil menambahkan data Kab/Kota ${form.getValues('nama')}!`,
        })
        trigger()
        return destroyDrawerModal(ctx)
      })
      .catch((err)=>{
        console.log('err: ',err);      
        toast({
          title: stringifyError(err.response.data?.message),
          variant: 'destructive'
        })
      })
      .finally(()=>{
        setTimeout(()=>{
          setIsLoading(false)
        },500)
      })
    }
    else {
      await putKecamatan(router,dataForm,data.id)
      .then(()=>{
        toast({
          title: `Berhasil mengubah data kecamatan ${form.getValues('nama')}!`,
        })
        trigger()
        return destroyDrawerModal(ctx)
      })
      .catch((err)=>{
        console.log('err: ',err);      
        toast({
          title: stringifyError(err.response.data?.message),
          variant: 'destructive'
        })
      })
      .finally(()=>{
        setTimeout(()=>{
          setIsLoading(false)
        },500)
      })
    }
  }

  const firstInit = async()=> {
    setIsLoading(true)
    await Promise.all([
        getProvinsi(router,'?limit=99'),
        getKabKota(router,'?limit=999'),
    ])
    .then((responses)=>{
        const [province,kab_kota] = responses
        
        const provinces = province.data.data.map((item:ProvinsiI) => ({
            value: item.id.toString(),
            label: item.nama,
        }));
        setProvinsiOptions(provinces)
        setAllKabKota(kab_kota.data.data)
        if (data){
          getKotaByProvince(data.id_provinsi,kab_kota.data.data)
          form.setValue('id_provinsi',data.id_provinsi.toString())
          form.setValue('nama',data.nama)
          form.setValue('id_kabupaten_kota',data.id_kabupaten_kota.toString())
        }
        
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

  const getKotaByProvince = (id:string|number, DataAllKabKota:Array<any>=allKabKota)=> {
    setIsKotaLoading(true)
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="id_provinsi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Provinsi</FormLabel>
              <Combobox 
                  options={provinsiOptions}
                  placeholder="Pilih Provinsi"
                  value={field.value}
                  onSelect={(e)=>{
                    form.setValue("id_provinsi",e)
                    getKotaByProvince(e)
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
              <FormLabel>Nama Kab/Kota</FormLabel>
              <Combobox 
                  options={kabKotaOptions}
                  placeholder="Pilih Kab/Kota"
                  value={field.value}
                  onSelect={(e)=>{
                    form.setValue('id_kabupaten_kota',e)
                  }}
                  isLoading={isKotaLoading}
                  disabled={kabKotaOptions.length === 0 || isKotaLoading}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kecamatan</FormLabel>
              <FormControl>
                <Input placeholder="Kecamatan" {...field} autoFocus={false}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-x-2">
          <Button type="button" variant={"outline"} onClick={()=>destroyDrawerModal(ctx)}>Batal</Button>
          <Button type="submit"> 
           {isLoading && (
            <ReloadIcon className="mr-2 h-3 w-3 animate-spin"/>
           )}
            {!data ? 'Tambah' : 'Ubah'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default FormData
