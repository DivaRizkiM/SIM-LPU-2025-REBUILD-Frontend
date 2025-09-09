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
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { FormCustomOption } from "../../../../../../store/state"
import { kcuI } from "../columns"

const MAX_FILE_SIZE = 500000;
const ACCEPTED_FILE_TYPES = [ ".geojson"];
const FormSchema = z.object({
  id: z.any(),
  kode: z.any(),
  regional: z.any(),
  GeoJson: z 
    .any()
    .refine((files) => files?.length == 1, "Geo Json tidak boleh kosong")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Maksimal ukuran 5 MB.`)
    .refine(
      (files) => files?.[0]?.name.endsWith(ACCEPTED_FILE_TYPES),
        "Hanya file .geojson yang dapat diterima"
    ),
  longitude: z.string({required_error: 'Longitude tidak boleh kosong'}),
  latitude: z.string({required_error: 'Latitude tidak boleh kosong'})
})

interface FromDataI {
  trigger: ()=>void
  data?: kcuI
}
const FormData:FC<FromDataI> = ({ trigger,data })=> {
  const ctx = context()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const fileRef = form.register('GeoJson');

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
    // setIsLoading(true)
  }

  const firstInit = async()=> {
    // setIsLoading(true)
    form.setValue('kode',data?.kode)
    form.setValue('regional',data?.nama)
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
          name="kode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode</FormLabel>
              <FormControl>
                <Input {...field} autoFocus={false} disabled/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="regional"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama KPRK</FormLabel>
              <FormControl>
                <Input {...field} autoFocus={false} disabled/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="GeoJson"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GeoJson</FormLabel>
              <FormControl>
                <Input type="file"  {...fileRef} autoFocus={false} 
                  // onChange={(event) => {
                  //   field.onChange(event.target?.files?.[0] ?? undefined);
                  // }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus={false} placeholder="contoh: 106.816666"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="latitude"
          
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus={false} placeholder="contoh: -6.200000" disabled/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
