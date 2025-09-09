"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { RefreshCcw } from "lucide-react"
import months from '@/lib/months.json'
import { useState } from "react"
import { QueryParams, buildQueryParam, stringifyError } from "../../../../../helper"
import {  syncLampiranBiaya } from "../../../../../services"
import { toast } from "@/components/ui/use-toast"
import { context } from "../../../../../store"

export function DataLampiranBiaya() {
    const router = useRouter()
    const ctx = context()
    const [tahun, setTahun] = useState<string>("")
    const [bulan, setBulan] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const onSync = async()=> {
        setIsLoading(true)
        try {
            let tempParams:QueryParams = {};
            tempParams.tahun = tahun
            tempParams.bulan = bulan
            const params = buildQueryParam(tempParams) || '';
            
            const res = await syncLampiranBiaya(router,params);
            
            toast({
                title: res.data.message
            })
        } catch (error:any) {
            console.log('Err: ',error);
            toast({
                title: error.response?.data 
                    ? stringifyError(error.response?.data.message)
                    : error.message,
                variant: 'destructive'
            })
        }
        finally {
            setTimeout(()=>{
                setIsLoading(false)
            },500)
        }
    }
    const onClickSync = ()=> {
        ctx.dispatch({
            alertDialog: {
                title: `Apakah anda yakin ingin menyinkronkan lampiran biaya?`,
                type: 'sync',
                onSubmit: async()=>{
                    await onSync()
                }
            }
        })
    }   

    return (
    <Card className="overflow-hidden">
        <CardHeader className="bg-sky-300 dark:bg-sky-950 mb-5">
            <CardTitle>Lampiran Biaya</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
           
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="area">Tahun*</Label>
                    <Select onValueChange={(e)=>setTahun(e)} value={tahun}>
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
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="area">Bulan*</Label>
                    <Select onValueChange={(e)=>setBulan(e)} value={bulan}>
                        <SelectTrigger id="area">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((bulan,key)=>(
                                <SelectItem value={bulan.value} key={key}>{bulan.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardContent>
        <CardFooter className="">
            <Button className="w-full" variant={"secondary"} onClick={onClickSync}>
                <RefreshCcw className="mr-2 w-4 h-4"/>
                Sinkronisasi
            </Button>
        </CardFooter>
    </Card>
    )
}