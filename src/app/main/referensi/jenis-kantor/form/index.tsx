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
import { postJenisKantor, putJenisKantor } from "../../../../../../services"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { JenisKantorI } from "../columns"

const FormSchema = z.object({
  nama: z.string({required_error: 'Nama Jenis Kantor tidak boleh kosong'}).min(1, {
    message: "Nama Jenis Kantor harus lebih dari 1 karakter.",
  }),
  id: z.any(),
})

interface FormDataI {
  trigger: ()=>void,
  data?: JenisKantorI
}
const FormData:FC<FormDataI> = ({ trigger,data })=> {
  const ctx = context()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
    setIsLoading(true)
    if (!data){
      await postJenisKantor(router,dataForm)
      .then((res)=>{
        toast({
          title: `Berhasil menambahkan data Jenis Kantor ${form.getValues('nama')}!`,
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
      const payload = {
        nama: dataForm.nama
      }
      await putJenisKantor(router,payload,data.id)
      .then(()=>{
        toast({
          title: `Berhasil mengubah data Jenis Kantor ${form.getValues('nama')}!`,
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
      form.setValue('nama',data.nama)
      form.setValue('id',data.id)
    }
  }
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(firstInit,[])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="nama"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Kantor</FormLabel>
              <FormControl>
                <Input placeholder="Jenis Kantor" {...field} autoFocus={false}/>
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
