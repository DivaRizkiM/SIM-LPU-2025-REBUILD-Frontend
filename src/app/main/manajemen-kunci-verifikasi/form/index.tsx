"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { destroyDrawerModal, stringifyError } from "../../../../../helper"
import { context } from "../../../../../store"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { LockVerifikasiI } from "../../../../../services/types"
import { postLockVerifikasi, putLockVerifikasi } from "../../../../../services"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import months from '@/lib/months.json'
import { Switch } from "@/components/ui/switch"

const FormSchema = z.object({
  // kodeProvinsi: z.string({required_error: 'Kode Provinsi tidak boleh kosong'}),
  id: z.any(),
  tahun: z.string({required_error: 'Tahun tidak boleh kosong'}),
  bulan: z.string({required_error: 'Bulan tidak boleh kosong'}),
  status: z.boolean().optional(),
})

interface addDataI {
  trigger: ()=>void,
  data?: LockVerifikasiI
}
const AddData:FC<addDataI> = ({ trigger,data })=> {
  const ctx = context()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: true
    }
  })
  
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
    setIsLoading(true)
    if (!data){
      await postLockVerifikasi(router,dataForm)
      .then((res)=>{
        toast({
          title: `Berhasil menambahkan data lock verifikasi!`,
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
        tahun: parseInt(dataForm.tahun),
        bulan: parseInt(dataForm.bulan),
        status: dataForm.status
      }
      await putLockVerifikasi(router,payload,data.id)
      .then(()=>{
        toast({
          title: `Berhasil mengubah data!`,
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
      setTimeout(()=>{
        form.setValue('bulan',data.bulan.toString())
        form.setValue('tahun',data.tahun.toString())
        form.setValue('status',data.status)
      },100)
    }
  }
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(firstInit,[])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        {!data && (
          <>
          <FormField
              control={form.control}
              name="tahun"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="area" className="text-base">Tahun*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="area">
                          <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                                                <SelectItem value="2025">2025</SelectItem>
                        
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2020">2020</SelectItem>
                      </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
          <FormField
              control={form.control}
              name="bulan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="area" className="text-base">Bulan*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="area">
                          <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                          {months.map((month,key)=>(
                              <SelectItem value={month.value} key={key}>{month.label}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </>
        )}
        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Status Kunci Verifikasi
                  </FormLabel>
                  <FormDescription>
                  Jika diaktifkan, proses verifikasi akan terkunci untuk menjaga integritas data.
                  </FormDescription>
                </div>
                <div className="flex items-center gap-x-2 text-xsa">
                    {field.value ? (
                      <div className="text-red-800/70">Locked</div>
                    ): (
                      <div className="text-green-800/70">Opened</div>
                    )}
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
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

export default AddData
