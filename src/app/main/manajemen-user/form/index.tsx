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
import { destroyDrawerModal, stringifyError } from "../../../../../helper"
import { context } from "../../../../../store"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { FormCustomOption } from "../../../../../store/state"
import { UserI } from "../columns"
import { PlusCircle } from "lucide-react"
import { getStatusGroup, postUser, putUser } from "../../../../../services"
import Combobox from "@/components/tools/combobox"

const MAX_FILE_SIZE = 500000;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
];
const FormSchema = z.object({
  id: z.any(),
  nip: z.string({required_error: 'NIP tidak boleh kosong'}),
  nama: z.string({required_error: 'Nama tidak boleh kosong'}),
  foto: z 
  .any(),
  // .optional()
  // .refine((files) => files?.length == 1, "Foto tidak boleh kosong")
  // .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Maksimal ukuran 5 MB.`)
  // .refine(
  //   (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.[0]?.type),
  //   "Only .jpg, .jpeg, formats are supported."
  // )
  // .optional(),
  username: z.string({required_error: 'Username tidak boleh kosong'}),
  nama_grup: z.string({required_error: 'Tipe User tidak boleh kosong'}),
  password: z.string({required_error: 'Password tidak boleh kosong'}),
  password_confirmation: z.string({required_error: 'Konfirmasi Password tidak boleh kosong'})
}).superRefine(({ password_confirmation, password }, ctx) => {
    if (password_confirmation !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Password konfirmasi tidak sama dengan password",
        path: ['password_confirmation']
      });
  }

})

interface FromDataI {
  trigger: ()=>void
  data?: UserI
}
const FormData:FC<FromDataI> = ({ trigger,data })=> {
  const ctx = context()
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })
  const [tipe_user_options, setTipe_user_options] = useState<Array<FormCustomOption>>([])

  const fileRef = form.register('foto');

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
    setIsLoading(true)
    const payload:any = {
      nip: dataForm.nip,
      nama: dataForm.nama,
      foto: dataForm.foto,
      username: dataForm.username,
      id_grup: dataForm.nama_grup,
      password: dataForm.password,
      password_confirmation: dataForm.password_confirmation
    }
    if (!data){
      payload.id_status = 1
      
      await postUser(router,payload)
        .then((res)=> {
          trigger()
          destroyDrawerModal(ctx)
          toast({
            title: `Berhasil menambahkan data ${dataForm.nama}`,
          })
        })
        .catch((err)=>{
          console.log('Err: ',err);
          toast({
            title: stringifyError(err.response.data?.errors),
            variant: 'destructive'
          })
        })
        .finally(()=>{
          setIsLoading(false)
        })
    } else {
      await putUser(router,payload,dataForm.id)
        .then((res)=> {
          trigger()
          destroyDrawerModal(ctx)
          toast({
            title: `Berhasil mengubah data ${dataForm.nama}`,
          })
        })
        .catch((err)=>{
          console.log('Err: ',err);
          toast({
            title: stringifyError(err.response.data?.errors),
            variant: 'destructive'
          })
        })
        .finally(()=>{
          setIsLoading(false)
        })
    }
    
  }

  const firstInit = async()=> {
    console.log('data: ',data);
    
    setIsLoading(true)
    await getStatusGroup(router,'')
      .then((res)=> {
        const StatusGroupes = res.data.data.map((item:any) => ({
          value: item.id.toString(),
          label: item.nama,
      }));
      setTipe_user_options(StatusGroupes)
      })
      .catch((err)=>{
        console.log('Err: ',err);
      })
    if (data){
      form.setValue('id',data?.id)
      form.setValue('nip',data?.nip)
      form.setValue('nama',data?.nama)
      form.setValue('username',data?.username)
      form.setValue('nama_grup',data?.id_grup.toString())
    }
    setIsLoading(false)
  }
  
  useEffect(()=>{
      firstInit()
      /* eslint-disable react-hooks/exhaustive-deps */
  },[])
  


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="nip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIP</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus={false}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus={false}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus={false}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama_grup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe User</FormLabel>
                  <FormControl>
                    <Combobox 
                    value={form.getValues('nama_grup')} 
                    options={tipe_user_options} 
                    placeholder={"Pilih tipe user"} 
                    onSelect={(value: string) => {
                      form.setValue('nama_grup',value)
                    }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus={false} type="password"/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Password</FormLabel>
                <FormControl>
                  <Input {...field} autoFocus={false} type="password"/>
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
