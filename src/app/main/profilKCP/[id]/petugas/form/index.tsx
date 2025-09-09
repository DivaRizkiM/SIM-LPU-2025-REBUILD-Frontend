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
import { destroyDrawerModal, stringifyError } from "../../../../../../../helper"
import { context } from "../../../../../../../store"
import { postPetugasKpc, postProvinsi, putPetugasKpc, putProvinsi } from "../../../../../../../services"
import { useParams, useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { PetugasKPC } from "../columns"

const FormSchema = z.object({
  nama_petugas: z.string({required_error: 'Nama Provinsi tidak boleh kosong'}).min(1, {
    message: "Nama Provinsi harus lebih dari 1 karakter.",
  }),
  nippos: z.string({required_error: 'Nippos tidak boleh kosong'}),
  id: z.any(),
  pangkat:z.string().optional(),
  masa_kerja:z.string().optional(),
  jabatan: z.string(),
  id_kpc: z.number().optional(),
  id_user: z.number().optional(),
})

interface FormData {
  trigger: ()=>void,
  data?: PetugasKPC
}
const FormData:FC<FormData> = ({ trigger,data })=> {
  const ctx = context()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const params = useParams<{id: string}>()

  const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
    setIsLoading(true)
    if (!data){
        // form.setValue('id_user',)
        dataForm.id_kpc = parseInt(params.id)
      await postPetugasKpc(router,dataForm)
      .then((res)=>{
        toast({
            title: `Berhasil menambahkan data petugas ${dataForm.nama_petugas}!`,
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
      await putPetugasKpc(router,dataForm,data.id)
      .then(()=>{
        toast({
          title: `Berhasil mengubah data petugas ${dataForm.nama_petugas}!`,
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

  const firstInit = ()=> {
    if (data){
      form.setValue('nama_petugas',data.nama_petugas)
      form.setValue('nippos',data.nippos)
      form.setValue('pangkat',data.pangkat ?? '')
      form.setValue('masa_kerja',data.masa_kerja ?? '')
      form.setValue('jabatan',data.jabatan)
    }
  }
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(firstInit,[])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name='nama_petugas'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Petugas</FormLabel>
              <FormControl>
                <Input placeholder="Nama Petugas" {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='pangkat'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pangkat</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan Pangkat" {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='masa_kerja'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Masa Kerja</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Masukkan Masa Kerja" {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='jabatan'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jabatan</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan Jabatan" {...field}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='nippos'
          render={({ field }) => (
            <FormItem>
              <FormLabel>NIPPOS</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan NIPPOS" {...field}/>
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
