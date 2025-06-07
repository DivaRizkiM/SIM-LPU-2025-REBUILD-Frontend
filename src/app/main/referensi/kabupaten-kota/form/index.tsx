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
import { getProvinsi, postKabKota, putKabKota } from "../../../../../../services"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import Combobox from "@/components/tools/combobox"
import { FormCustomOption } from "../../../../../../store/state"
import { KabKotaI } from "../columns"
import { ProvinsiI } from "../../provinsi/columns"

const FormSchema = z.object({
  // kodeProvinsi: z.string({required_error: 'Kode Provinsi tidak boleh kosong'}),
  nama: z.string({required_error: 'Nama Kecamatan tidak boleh kosong'}).min(1, {
    message: "Nama Kecamatan harus lebih dari 1 karakter.",
  }),
  id_provinsi: z.string({required_error: 'Nama Provinsi tidak boleh kosong'}).min(1, {
    message: "Nama Provinsi harus lebih dari 1 karakter.",
  }),
})

interface FormDataI {
  trigger: ()=>void
  data?: KabKotaI
}
const FormData:FC<FormDataI> = ({ trigger,data })=> {
  const ctx = context()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [provinsiOptions, setProvinsiOptions] = useState<Array<FormCustomOption>>([])

  const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
    setIsLoading(true)
    if (!data){
      await postKabKota(router,dataForm)
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
      await putKabKota(router,dataForm,data.id)
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
    await getProvinsi(router,'?limit=99')
    .then((res)=>{      
        const provinces = res.data.data.map((item:ProvinsiI) => ({
            value: item.id.toString(),
            label: item.nama,
        }));
        setProvinsiOptions(provinces)
        if (data){
          form.setValue('id_provinsi',data.id_provinsi.toString())
          form.setValue('nama',data.nama)
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
                  }}
                  // isLoading={isRegionalLoading}
                  disabled={provinsiOptions.length === 0}
              />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Kab/Kota</FormLabel>
              <FormControl>
                <Input placeholder="Kabupaten/kota" {...field} autoFocus={false}/>
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
