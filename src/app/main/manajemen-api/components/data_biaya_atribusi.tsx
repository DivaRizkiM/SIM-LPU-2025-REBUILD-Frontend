"use client"

import Combobox from "@/components/tools/combobox"
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
import { useEffect, useState } from "react"
import { syncBiayaAtribusi, getKPRK, getKpcByKcu, getRegional } from "../../../../../services"
import { useRouter } from "next/navigation"
import { FormCustomOption } from "../../../../../store/state"
import { RegionalI } from "../../referensi/regional/columns"
import { kcuI } from "../../referensi/kc-kcu/columns"
import { RefreshCcw } from "lucide-react"
import months from '@/lib/months.json'
import { ProfilKcpI } from "../../profilKCP/columns"
import { QueryParams, buildQueryParam, stringifyError } from "../../../../../helper"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { context } from "../../../../../store"

export function DataBiayaAtribusi() {
    const router = useRouter()
    const ctx = context()
    const [regional, setRegional] = useState<string>("")
    const [regionalOptions, setRegionalOptions] = useState<Array<FormCustomOption>>([])
    const [isRegionalLoading,setIsRegionalLoading] = useState<boolean>(false)

    const [tempKcu, setTempKcu] = useState<Array<kcuI>>([])
    const [kcuOptions,setKcuOptions] = useState<Array<FormCustomOption>>([])
    const [kcu, setKcu] = useState<string>("")
    const [isKcuLoading,setIsKcuLoading] = useState<boolean>(false)

    const [kcp, setKcp] = useState<string>("")
    const [kcpOptions, setKcpOptions] = useState<Array<FormCustomOption>>([])
    const [isKcpLoading,setIskcpLoading] = useState<boolean>(false)

    const [tahun, setTahun] = useState<string>("")
    const [triwulan, setTriwulan] = useState<string>("")

    const [biayaAtribusiCategory, setBiayaAtribusiCategory] = useState<string>("")

    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    
    const firstInit = async()=> {
        setIsRegionalLoading(true)
        await Promise.all([
            getRegional(router,'?limit=99'),
            getKPRK(router,'?limit=999'),
        ])
        .then((responses)=>{
            const [regional,kcu] = responses

            const regionals = regional.data.data.map((item:RegionalI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            setRegionalOptions(regionals)
            setTempKcu(kcu.data.data)
        })
        .catch((err)=>{
            console.log('Err: ',err);
        })
        .finally(()=>{
            setIsRegionalLoading(false)
        })
    }
    useEffect(()=>{
        firstInit()
        /* eslint-disable react-hooks/exhaustive-deps */
    },[])

    const getKcuByRegional = async(id:string|number)=> {
        setIsKcuLoading(true)
        try {
            const kcuYangCocok:kcuI[] = tempKcu.filter((item:kcuI) => item.id_regional.toString() === id.toString());
            const kcuFiltered = await kcuYangCocok.map((item:kcuI) => ({
                value: item.id.toString(),
                label: item.nama,
            }));
            kcuFiltered.unshift({
                value: '',label: 'Pilih Semua KCU'
            })
            setKcuOptions(kcuFiltered)
            setKcu('')
            setKcp('')
            setKcpOptions([])
        } catch (error) {
            console.log('Err: ',error);   
        } finally {
            setTimeout(()=>{
                setIsKcuLoading(false)
            },500)
        }   
    }

    const getKpcByKcuHandler = async(id:string)=> {
        setIskcpLoading(true)
        try {
            const res = await getKpcByKcu(router,id)
            const KCPFiltered = res.data.data.map((item:ProfilKcpI) => ({
                value: item.nomor_dirian.toString(),
                label: item.nama,
            }));
            KCPFiltered.unshift({
                value: '',label: 'Pilih Semua KCP'
            })
            setKcpOptions(KCPFiltered)
            setKcp('')
        } catch (error) {
            console.log('Err: ',error);
        }
        finally {
            setTimeout(()=>{
                setIskcpLoading(false)
            },500)
        }
    }

    const onSync = async()=> {
        setIsLoading(true)
        try {
            let params:QueryParams = {};
            params.id_kprk = kcu
            params.kategori_biaya = biayaAtribusiCategory
            params.bulan = triwulan
            params.tahun = tahun
            params.id_regional = regional
            const tempParams = buildQueryParam(params) || '';

            const res = await syncBiayaAtribusi(router,tempParams)
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
                title: `Apakah anda yakin ingin menyinkronkan data biaya atribusi?`,
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
            <CardTitle>Data Biaya Atribusi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
            <Combobox 
                options={regionalOptions}
                placeholder="Pilih Regional*"
                value={regional}
                onSelect={(e)=>{
                    setRegional(e)
                    getKcuByRegional(e)
                }}
                isLoading={isRegionalLoading}
                disabled={regionalOptions.length === 0 || isKcuLoading}
            />
            <Combobox 
                options={kcuOptions}
                placeholder="Pilih KCU"
                value={kcu}
                onSelect={(e)=>{
                    setKcu(e)
                    getKpcByKcuHandler(e)
                }}
                disabled={kcuOptions.length === 0 || isKcuLoading}
                isLoading={isKcuLoading}
            />
            <Combobox 
                options={kcpOptions}
                placeholder="Pilih KCP"
                value={kcp}
                onSelect={(e)=>{
                    setKcp(e)
                }}
                disabled={kcpOptions.length === 0 || isKcpLoading}
                isLoading={isKcpLoading}
            />
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="area">Tahun*</Label>
                    <Select onValueChange={(e)=>setTahun(e)} value={tahun}>
                        <SelectTrigger id="area">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <Select onValueChange={(e)=>setTriwulan(e)} value={triwulan}>
                        <SelectTrigger id="area">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month,key)=>(
                                <SelectItem value={month.value} key={key}>{month.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid gap-2">
                    <Label htmlFor="area">Kategori Biaya Atribusi*</Label>
                    <Select onValueChange={(e)=>setBiayaAtribusiCategory(e)} >
                        <SelectTrigger id="area">
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Atribusi Biaya Operasi</SelectItem>
                            <SelectItem value="2">Biaya Sopir Tersier</SelectItem>
                            <SelectItem value="3">Biaya UPL</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
        </CardContent>
        <CardFooter className="">
            <Button 
                onClick={onClickSync}
                className="w-full" 
                variant={"secondary"}
                disabled={isLoading}
            >
                <RefreshCcw className={cn(isLoading && 'animate-spin','mr-2 w-4 h-4')}/>
                Sinkronisasi
            </Button>
        </CardFooter>
    </Card>
    )
}