"use client"
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { FC, useEffect, useState } from "react";
import { getProvinsi, getKabKota, getKecamatan, getKelurahan, postRekonsiliasi, postTargetAnggaran, putTargetAnggaran } from "../../../../../../services";
import { useRouter } from "next/navigation";
import { FormCustomOption } from "../../../../../../store/state";
import Combobox from "@/components/tools/combobox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { KecamatanI } from "@/app/main/referensi/kecamatan/columns";
import { KabKotaI } from "@/app/main/referensi/kabupaten-kota/columns";
import { KelurahanI } from "@/app/main/referensi/kelurahan/columns";
import { IRekonsiliasi, ITargetAnggaran, ProvinsiI } from "../../../../../../services/types";
import { context } from "../../../../../../store";
import { penyelenggaraList } from "../data-table";

const FormSchema = z.object({
    nominal: z.string(),
    tahun: z.string(),
  })
interface AddI {
    data?: ITargetAnggaran,
    trigger: ()=>Promise<void>
}
const Add:FC<AddI> = ({data,trigger})=> {
    const router = useRouter()
    const ctx = context()
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })
    
    const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
        setIsSubmitting(true)
        const payload = {
            tahun: parseInt(dataForm.tahun),
            nominal: parseInt(dataForm.nominal)
        }
        if (!data){
            await postTargetAnggaran(router,payload)
            .then(()=>{
                toast({
                    title: 'Berhasil menambahkan target anggaran!'
                })
                trigger()
                return ctx.dispatch({
                    isModal: undefined
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
        }else {
            if (!data?.id)return
            await putTargetAnggaran(router,payload,data.id)
            .then(()=>{
                toast({
                    title: 'Berhasil mengubah target anggaran!'
                })
                trigger()
                return ctx.dispatch({
                    isModal: undefined
                })
            })
            .catch((err)=> {
                toast({
                    title: err?.message || 'Terdapat kesalahan',
                    variant: 'destructive'
                })
            })
            .finally(()=>{
                setIsSubmitting(false)
            })
        }

    }
    const firstInit = async()=>{
        if (data){
            setIsLoading(true)
            setTimeout(()=>{
                form.setValue('nominal',parseInt(data.nominal as any).toFixed(0))
                form.setValue('tahun',data.tahun.toString())
                setIsLoading(false)
            },800)
        }
    }
    useEffect(()=>{
        firstInit()
        /* eslint-disable react-hooks/exhaustive-deps */
    },[])


    
    return(
        <div className="relative h-full">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} id="form_update_kcp" className="py-1 md:py-2 pb-[100px] relative">
                <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                    control={form.control}
                    name="nominal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nominal</FormLabel>
                            <Input 
                                type="number" 
                                placeholder={ isLoading ? 'Loading..' :"Masukkan Nominal" }
                                disabled={isLoading}
                                {...field}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name='tahun'
                    render={({field})=> (
                        <FormItem>
                            <FormLabel>Tahun Anggaran</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}> 
                                <SelectTrigger id="area">
                                    <SelectValue placeholder={isLoading ? 'Loading..' : 'Pilih Tahun Anggaran'} />
                                </SelectTrigger>
                                <SelectContent>
                                                            <SelectItem value="2025">2025</SelectItem>
                                    
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2026">2026</SelectItem>
                                    <SelectItem value="2027">2027</SelectItem>
                                    <SelectItem value="2028">2028</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            <div className="sticky bottom-0 left-0 right-0 space-x-2 md:space-x-5 flex justify-end items-center pt-7">
                <Button 
                    className="text-white" 
                    onClick={form.handleSubmit(onSubmit)} 
                    type="submit"
                    size='lg'
                >
                    {isSubmitting && (
                        <ReloadIcon className="mr-2 h-3 w-3 animate-spin"/>
                    )}
                    Simpan
                </Button>
            </div>
            </form>
            </Form>
        </div>
    )
}

export default Add