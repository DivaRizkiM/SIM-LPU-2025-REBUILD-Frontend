'use client'

import { getDetailVerifikasiProduksi, postVerifikasiProduksi } from "../../../../../services";
import { useRouter } from "next/navigation";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {  VerifikasiProduksiDetailI } from "@/lib/types";
import { cn } from "@/lib/utils";
import { cleanCurrencyFormat, formatCurrency, stringifyError } from "../../../../../helper";
import { toast } from "@/components/ui/use-toast";
import { IFormVerifikasiProduksi } from "../../../../../services/types";
import { ReloadIcon } from "@radix-ui/react-icons"
import dynamic from "next/dynamic";
import { context } from "../../../../../store";
import { Loader2 } from "lucide-react";

interface IDetailVerifProduksi {
    id_produksi_detail: string|number
    trigger: any
}

const Detail:FC<IDetailVerifProduksi> = ({id_produksi_detail,trigger})=> {
    const router = useRouter()
    const [Datasource,setDataSource] = useState<Array<VerifikasiProduksiDetailI>>([])
    const [selectedID, setSelectedID] = useState<string>('')
    const [indexSelected, setIndexSelected] = useState<number>(0)
    const [selectedData, setSelectedData] = useState<VerifikasiProduksiDetailI>()
    const [animateTrigger, setAnimateTrigger] = useState<boolean>(false)
    const [dataVerifications, setDataVerifications] = useState<Array<IFormVerifikasiProduksi>>([])
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const ctx = context()
    
    

    const firstInit = async()=> {
        setIsLoading(true)
        const params = `?id_produksi_detail=${id_produksi_detail}`
        
        await getDetailVerifikasiProduksi(router,params)
            .then((res)=>{
                const dataResponse:VerifikasiProduksiDetailI[] = res.data.data
                if (((res.data as any).isLock)){
                    ctx.dispatch({isModal: undefined})
                }
                setDataSource(dataResponse)
                const dataEarlier:VerifikasiProduksiDetailI = dataResponse[0]
                setSelectedID(dataEarlier.id_produksi_detail)
                setSelectedData(dataEarlier)

                const tempDataVerifs:IFormVerifikasiProduksi[] = dataResponse.map((data)=>{
                    return {
                        id_produksi_detail: data.id_produksi_detail,
                        verifikasi: cleanCurrencyFormat(data.verifikasi),
                        catatan_pemeriksa: data.catatan_pemeriksa,
                        isVerifikasiSesuai: data.verifikasi === "Rp 0,00" ? "" : (data.verifikasi === data.pelaporan ? "1" : '0')
                    }
                })
                setDataVerifications(tempDataVerifs)
                
            })
            .catch((err)=> {
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

    useEffect(()=>{
        if (animateTrigger){
            setTimeout(()=>{
                setAnimateTrigger(false)
            },300)
        }
    },[animateTrigger])
    

    function handleInput(event: ChangeEvent<any>) {
        const eventName = event.target.name 
        const value = event.target.value
        if (indexSelected >= 0){
            const tempData = [...dataVerifications]
            tempData[indexSelected] = {
                ...tempData[indexSelected],
                [eventName]:eventName === "verifikasi" ? formatCurrency(value) : value
            }
            setDataVerifications(tempData)
        }
    }
    const selectHandler = (val:"0"|"1")=>{
        const tempData = [...dataVerifications]
        if (val === "1"){
            tempData[indexSelected].verifikasi = cleanCurrencyFormat(selectedData?.pelaporan || '')
        }else {
            tempData[indexSelected].verifikasi = ""
        }
        tempData[indexSelected].isVerifikasiSesuai = val
        setDataVerifications(tempData)
    }
    
    const onSubmitVerifikasi = async()=> {
        setIsSubmitting(true)
        const tempData:Array<any> = dataVerifications.map((data)=>{
            return {
                id_produksi_detail: data.id_produksi_detail.toString(),
                verifikasi: data.verifikasi,
                catatan_pemeriksa: data.catatan_pemeriksa,
            }
        })
        const payload = {
            data: tempData
        }
        await postVerifikasiProduksi(router,selectedID,payload)
            .then((res)=> {
                toast({
                    title: `Berhasil submit verifikasi`
                })
                trigger()
                return ctx.dispatch({isModal:undefined})
            })
            .catch((err)=> {
                console.log("Err: ",err)
                toast({
                    title: stringifyError(err.response.data.message),
                    variant: 'destructive',
                })
            })
            .finally(()=>{
                setTimeout(()=>{
                    setIsSubmitting(false)
                },500)
            })
    }

    return(
        <div className="relative px-2 md:px-4" id="trest">
            {isLoading && (
                <div className="fixed md:absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin"/>
                </div>
            )}
            <div className={cn(animateTrigger ? 'translate-x-5 md:translate-x-10 opacity-50' : 'translate-x-0 opacity-1','rounded-md md:px-3 p-2 w-full transition-all duration-200')} ref={containerRef}>
                    <div className="space-y-2">
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <Label>Jenis Layanan</Label>
                            <Input value={selectedData?.jenis_layanan} className="w-full col-span-3 bg-secondary" readOnly/>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <Label>Kode Rekening</Label>
                            <Input value={selectedData?.kode_rekening} className="w-full col-span-3 bg-secondary" readOnly/>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <Label>Produk (Keterangan)</Label>
                            <Input value={selectedData?.produk_keterangan} className="w-full col-span-3 bg-secondary" readOnly/>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <Label>Aktivitas (Nama Kegiatan)</Label>
                            <Input value={selectedData?.aktivitas} className="w-full col-span-3 bg-secondary" readOnly/>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <Label>Nama Rekening</Label>
                            <Input value={selectedData?.nama_rekening} className="w-full col-span-3 bg-secondary" readOnly/>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <Label>Periode</Label>
                            <Input value={selectedData?.periode} className="w-full col-span-3 bg-secondary" readOnly/>
                        </div>
                    
                    <div className="space-y-2">
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <Label>Nominal Pelaporan</Label>
                            <Input value={selectedData?.pelaporan} className="w-full col-span-3 bg-secondary" readOnly/>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <div>
                                <Label>Pilih Kondisi*</Label>
                                {!dataVerifications[indexSelected]?.isVerifikasiSesuai && (
                                    <div className="text-xs text-red-600">Wajib diisi</div>
                                )}
                            </div>
                            <div className="w-full col-span-3">
                            <Select 
                                value={dataVerifications[indexSelected]?.isVerifikasiSesuai} 
                                onValueChange={selectHandler}
                            >
                                <SelectTrigger 
                                    className={!dataVerifications[indexSelected]?.isVerifikasiSesuai ? 'border-red-600': ''}
                                >
                                    <SelectValue placeholder="Pilih Kondisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    <SelectItem value="1">Sesuai</SelectItem>
                                    <SelectItem value="0">Tidak Sesuai</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <div>
                                <Label>Nominal Verifikasi*</Label>
                                {dataVerifications[indexSelected]?.verifikasi === "" && (
                                    <div className="text-xs text-red-600">Wajib diisi</div>
                                )}
                            </div>
                            <CurrencyInput
                                value={dataVerifications[indexSelected]?.verifikasi} 
                                name="verifikasi"
                                className={`
                                    w-full col-span-3 
                                    ${dataVerifications[indexSelected]?.isVerifikasiSesuai === "1" || dataVerifications[indexSelected]?.isVerifikasiSesuai === ""? "bg-secondary" : ''}
                                    ${dataVerifications[indexSelected]?.verifikasi === "" ? 'border-red-600' : ''}
                                `} 
                                readOnly={dataVerifications[indexSelected]?.isVerifikasiSesuai === "1" || dataVerifications[indexSelected]?.isVerifikasiSesuai === ""}
                                onChange={handleInput}
                            />
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 items-center">
                            <Label>Keterangan</Label>
                            <Textarea
                                name="catatan_pemeriksa"
                                value={dataVerifications[indexSelected]?.catatan_pemeriksa || ""}
                                onChange={handleInput}
                                className="w-full col-span-3"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end items-center gap-x-2 mt-2">
                <Button
                    variant={'outline'}
                    onClick={()=>ctx.dispatch({isModal: undefined})}
                >
                    Kembali
                </Button>
                <Button className="text-white" onClick={onSubmitVerifikasi}>
                    {isSubmitting && (
                        <ReloadIcon className="mr-2 h-3 w-3 animate-spin"/>
                    )}
                    Simpan
                </Button>
            </div>
        </div>
    )
}

export default Detail