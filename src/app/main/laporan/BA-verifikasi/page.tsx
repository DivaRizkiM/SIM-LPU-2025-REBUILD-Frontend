'use client'
import { NextPage } from "next";
import { useState } from "react";
import { postExportBeritaAcaraPenarikan, postExportBeritaAcaraVerifikasi } from "../../../../../services";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Input } from "@/components/ui/input";
import months from '@/lib/months.json'
import years from '@/lib/years.json'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const FormSchema = z.object({
    tanggal_kuasa: z.string({required_error: 'Tanggal kuasa tidak boleh kosong'}),
    no_verifikasi: z.string({required_error: 'No. Verifikasi tidak boleh kosong'}),
    no_verifikasi_2: z.string({required_error: 'No. Verifikasi 2 tidak boleh kosong'}),
    triwulan: z.string({required_error: 'Triwulan tidak boleh kosong'}),
    no_perjanjian_kerja: z.string({required_error: 'No. perjanjian kerja tidak boleh kosong'}),
    no_perjanjian_kerja_2: z.string({required_error: 'No. perjanjian kerja 2 tidak boleh kosong'}),
    tanggal_perjanjian: z.string({required_error: 'tanggal perjanjian tidak boleh kosong'}),
    tanggal_perjanjian_2: z.string({required_error: 'tanggal perjanjian 2 tidak boleh kosong'}),
    tahun_anggaran: z.string({required_error: 'tahun anggaran tidak boleh kosong'}),
    nama_pihak_pertama: z.string().optional(),
    nama_pihak_kedua: z.string().optional(),
    penalti_penyediaan_prasarana: z.string({required_error: 'penalti_penyediaan_prasarana tidak boleh kosong'}).optional(),
    penalti_waktu_tempuh_kiriman_surat: z.string({required_error: 'penalti_waktu_tempuh_kiriman_surat tidak boleh kosong'}).optional(),
    faktur_pengurangn: z.string({required_error: 'faktur_pengurangn tidak boleh kosong'}).optional(),
    pembayaran_bulan_1: z.string({required_error: 'pembayaran_bulan_1 tidak boleh kosong'}).optional(),
    pembayaran_bulan_2: z.string({required_error: 'faktur_pengurangn tidak boleh kosong'}).optional(),
  })

  const types = [
    { value: "1", label: "Realisasi"},
    { value: "2", label: "Prognosa"}
  ]

const BeritaAcaraPenarikan:NextPage = ()=>{
    const router = useRouter()
    const [isExportLoading,setIsExportLoading] = useState<boolean>(false)
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
      })

    const onSubmit = async (dataForm: z.infer<typeof FormSchema>)=>{
        setIsExportLoading(true)
        // dataForm.responseType = 'blob'
        try {
            const response = await postExportBeritaAcaraVerifikasi(router,dataForm)
            if (response.statusText !== "OK") {
                throw new Error('Failed to generate PDF');
            }
            
            const blob = await response.data;
            convertHtmlToPdf(blob);
          }
          catch(err:any){
            console.log('res export data error: ',err);
            toast({
                title: err?.message || 'Something wrong...',
                variant: 'destructive'
            })
         }
        finally{
            setIsExportLoading(false)
        }
    }

    const convertHtmlToPdf = (html: any) => {
         // Create a hidden div to inject the HTML content
         const mainElement = document.createElement('div');
         mainElement.innerHTML = html;
 
         // Inject custom CSS for desktop view
         const style = document.createElement('style');
         style.innerHTML = `
         @media screen and (max-width: 768px) {
             /* Override mobile styles with desktop styles */
             body {
             width: 1024px;
             margin: 0 auto;
             }
             /* Add any other styles as needed */
         }
         `;
         mainElement.appendChild(style);
        const doc = new jsPDF('p', 'pt', 'a3');
        doc.html(mainElement, {
            callback: function (doc) {
                doc.save('Berita Acara Verifikasi.pdf');
            },
            x: 130,
            y: 10,
            width: 570,
            windowWidth: 600
        });
    };

    return(
        <div className="px-3 lg:px-7 mt-5">
             
      
            <h1 className="text-center my-7 md:my-3 font-bold text-2xl">Berita Acara Verifikasi</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-x-5 gap-y-2">
                    <FormField 
                        control={form.control}
                        name="tanggal_kuasa"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Tanggal Kuasa</FormLabel>
                                <Input 
                                    type='date' 
                                    onChange={field.onChange}
                                    onSelect={field.onChange}
                                />
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="no_verifikasi"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>No. Verifikasi I</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="no_verifikasi_2"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>No. Verifikasi II</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="triwulan"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Triwulan</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={'1'}>Triwulan 1</SelectItem>
                                        <SelectItem value={'2'}>Triwulan 2</SelectItem>
                                        <SelectItem value={'3'}>Triwulan 3</SelectItem>
                                        <SelectItem value={'4'}>Triwulan 4</SelectItem>
                                        
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="no_perjanjian_kerja"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>No. Perjanjian Kerja I</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="no_perjanjian_kerja_2"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>No. Perjanjian Kerja II</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="tanggal_perjanjian"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Tanggal Perjanjian I</FormLabel>
                                <Input 
                                    type='date' 
                                    onChange={field.onChange}
                                    onSelect={field.onChange}
                                />
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="tanggal_perjanjian_2"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Tanggal Perjanjian II</FormLabel>
                                <Input 
                                    type='date' 
                                    onChange={field.onChange}
                                    onSelect={field.onChange}
                                />
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="tahun_anggaran"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Tahun Anggaran</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger id="area">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((month,key)=>(
                                            <SelectItem value={month.value} key={key}>{month.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                     <FormField 
                        control={form.control}
                        name="nama_pihak_pertama"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Nama Pihak Pertama</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                     <FormField 
                        control={form.control}
                        name="nama_pihak_kedua"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Nama Pihak Kedua</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <div className="col-span-2 mt-4">
                        Faktor Pengurang
                    </div>
                    <FormField 
                        control={form.control}
                        name="penalti_penyediaan_prasarana"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Penalti penyediaan prasarana</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="penalti_waktu_tempuh_kiriman_surat"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Penalti waktu tempuh kiriman surat</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="faktur_pengurangn"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Faktur pengurang</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="pembayaran_bulan_1"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Pembayaran Bulan 1</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 
                    <FormField 
                        control={form.control}
                        name="pembayaran_bulan_2"
                        render={({ field })=>(
                            <FormItem>
                                <FormLabel>Pembayaran Bulan 2</FormLabel>
                                <Input {...field}/>
                                <FormMessage/>
                            </FormItem>
                        )}
                    /> 

                    <div className="col-span-2">
                        <Button className="">
                            {isExportLoading ? (
                                <Loader2 className="w-4 h-4 me-2"/>
                            ): (
                                <Download className="w-4 h-4 me-2"/>
                            )}
                            Export Data
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
export default BeritaAcaraPenarikan