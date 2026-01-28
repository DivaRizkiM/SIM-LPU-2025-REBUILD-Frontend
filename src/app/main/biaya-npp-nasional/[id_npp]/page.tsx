'use client'
import { NextPage } from "next";
import { getDetailNppNasional, postVerifikasiNppNasional } from "../../../../../services";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { cleanCurrencyFormat, formatCurrency, stringifyError } from "../../../../../helper";
import { toast } from "@/components/ui/use-toast";
import { IFormNppVerifikasi, NppI } from "../../../../../services/types";
import { ReloadIcon } from "@radix-ui/react-icons"
import { DownloadCloud, Loader2 } from "lucide-react";


const Detail: NextPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const params = useParams<{ id_npp: string }>()
    const [Datasource, setDataSource] = useState<Array<NppI>>([])
    const [selectedID, setSelectedID] = useState<string>('')
    const [indexSelected, setIndexSelected] = useState<number>(0)
    const [selectedData, setSelectedData] = useState<NppI>()
    const [animateTrigger, setAnimateTrigger] = useState<boolean>(false)
    const [dataVerifications, setDataVerifications] = useState<Array<IFormNppVerifikasi>>([])
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isLocked, setIsLocked] = useState<boolean>(false)

    // Detect lock status from URL parameter
    const isLockParam = searchParams.get("isLock") === "1"

    const firstInit = async () => {
        const payload = `?id_npp=${params.id_npp}`
        setIsLoading(true)
        await getDetailNppNasional(router, payload)
            .then((res) => {
                const dataResponse: NppI[] = res.data.data
                const lockStatus = ((res.data as any).isLock)
                
                console.log("🔒 Lock Status dari Backend NPP:", lockStatus)
                console.log("🔒 Lock Status dari URL:", isLockParam)
                
                // Set lock state from backend or URL param
                setIsLocked(lockStatus || isLockParam)
                
                setDataSource(dataResponse)
                const dataEarlier: NppI = dataResponse[0]
                setSelectedID(dataEarlier.id.toString())
                setSelectedData(dataEarlier)

                const tempDataVerifs: IFormNppVerifikasi[] = dataResponse.map((data) => {
                    return {
                        id_npp: data.id,
                        verifikasi: cleanCurrencyFormat(data.verifikasi),
                        catatan_pemeriksa: data.catatan_pemeriksa,
                        isVerifikasiSesuai: data.verifikasi === "Rp 0,00" ? "" : (data.verifikasi === data.pelaporan ? "1" : '0')
                    }
                })
                setDataVerifications(tempDataVerifs)

            })
            .catch((err) => {
                console.log('Err: ', err);
            })
            .finally(() => {
                setIsLoading(false)
            })
    }
    useEffect(() => {
        firstInit()
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [])

    const onClickPagination = (data: NppI, index: number) => {
        if (data.id.toString() === selectedID) return
        setSelectedData(data)
        setAnimateTrigger(true)
        setSelectedID(data.id.toString())
        setIndexSelected(index)
    }

    useEffect(() => {
        if (animateTrigger) {
            setTimeout(() => {
                setAnimateTrigger(false)
            }, 300)
        }
    }, [animateTrigger])

    function handleInput(event: ChangeEvent<any>) {
        const eventName = event.target.name
        const value = event.target.value
        if (indexSelected >= 0) {
            const tempData = [...dataVerifications]
            tempData[indexSelected] = {
                ...tempData[indexSelected],
                [eventName]: eventName === "verifikasi" ? formatCurrency(value) : value
            }
            setDataVerifications(tempData)
        }
    }
    const selectHandler = (val: "0" | "1") => {
        const tempData = [...dataVerifications]
        if (val === "1") {
            tempData[indexSelected].verifikasi = cleanCurrencyFormat(selectedData?.pelaporan || '')
        } else {
            tempData[indexSelected].verifikasi = ""
        }
        tempData[indexSelected].isVerifikasiSesuai = val
        setDataVerifications(tempData)
    }

    const onSubmitVerifikasi = async () => {
        setIsSubmitting(true)
        const tempData: IFormNppVerifikasi[] = dataVerifications.map((data) => {
            return {
                id_npp: data.id_npp.toString(),
                verifikasi: data.verifikasi,
                catatan_pemeriksa: data.catatan_pemeriksa,
            }
        })
        const payload = {
            data: tempData
        }
        await postVerifikasiNppNasional(router, selectedID, payload)
            .then(() => {
                toast({
                    title: 'Berhasil submit verifikasi'
                })
                return router.push(`./`)
            })
            .catch((err) => {
                console.log("Err: ", err)
                toast({
                    title: stringifyError(err.response.data.message),
                    variant: 'destructive',
                })
            })
            .finally(() => {
                setTimeout(() => {
                    setIsSubmitting(false)
                }, 500)
            })
    }

    const checkVerifSync = (verifikasi: string, pelaporan: string) => {
        switch (verifikasi) {
            case '0':
                return 'outline'
            case pelaporan:
                return 'success'
            default:
                return 'warning'
        }
    }

    return (
        <div className="relative px-2 md:px-4 py-1 md:py-2 h-full overflow-hidden">
            {isLoading && (
                <div className="fixed md:absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                </div>
            )}
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">VERIFIKASI NPP - DETAIL</h3>
            <div className="flex space-x-2 h-full">
                <ul className="relative space-y-2 text-center w-14  md:w-16 max-h-svh overflow-y-scroll z-20">
                    {Datasource.map((data, key) => (
                        <li key={key}>
                            <Button
                                size={"default"}
                                variant={
                                    data?.id.toString() === selectedID
                                        ? 'default'
                                        : checkVerifSync(dataVerifications[key].verifikasi, cleanCurrencyFormat(data.pelaporan))
                                }
                                onClick={() => onClickPagination
                                    (data, key)}
                            >
                                {key + 1}
                            </Button>
                        </li>
                    ))}
                </ul>
                <div className={cn(animateTrigger ? 'translate-x-5 md:translate-x-10 opacity-50' : 'translate-x-0 opacity-1', 'rounded-md border md:px-3 p-2 w-full h-full overflow-y-scroll overflow-x-hidden transition-all duration-200 pb-40 md:pb-2')}>
                    <h3 className="scroll-m-20 text-lg font-semibold tracking-tight mb-3 text-center pb-2">Data Verifikasi</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Kode Rekening</Label>
                                <Input value={selectedData?.kode_rekening} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Nama Rekening</Label>
                                <Input value={selectedData?.nama_rekening} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Periode</Label>
                                <Input value={selectedData?.periode} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>{["10", "11"].includes(selectedData?.last_two_digits ?? '') ? "Pendapatan" : "Produksi "} Nasional</Label>
                                <Input value={["10", "11"].includes(selectedData?.last_two_digits ?? '') ? selectedData?.pendapatan_nasional : selectedData?.produksi_nasional} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>{["10", "11"].includes(selectedData?.last_two_digits ?? '') ? "Pendapatan" : "Produksi "} KCP Nasional</Label>
                                <Input value={["10", "11"].includes(selectedData?.last_two_digits ?? '') ? selectedData?.pendapatan_kcp_nasional : selectedData?.produksi_kcp_nasional} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Proporsi Januari</Label>
                                <Input value={selectedData?.proporsi} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Nominal Pelaporan</Label>
                                <Input value={selectedData?.pelaporan} className="w-full col-span-3 bg-secondary" readOnly />
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
                                        disabled={isLocked}
                                    >
                                        <SelectTrigger
                                            className={!dataVerifications[indexSelected]?.isVerifikasiSesuai ? 'border-red-600' : ''}
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
                                        ${dataVerifications[indexSelected]?.isVerifikasiSesuai === "1" || dataVerifications[indexSelected]?.isVerifikasiSesuai === "" || isLocked ? "bg-secondary" : ''}
                                        ${dataVerifications[indexSelected]?.verifikasi === "" ? 'border-red-600' : ''}
                                    `}
                                    readOnly={dataVerifications[indexSelected]?.isVerifikasiSesuai === "1" || dataVerifications[indexSelected]?.isVerifikasiSesuai === "" || isLocked}
                                    onChange={handleInput}
                                />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Catatan Pemeriksa</Label>
                                <Textarea
                                    name="catatan_pemeriksa"
                                    value={dataVerifications[indexSelected]?.catatan_pemeriksa || ""}
                                    onChange={handleInput}
                                    className="w-full col-span-3"
                                    disabled={isLocked}
                                />
                            </div>

                        </div>
                    </div>

                    <div className="flex gap-4 items-center mt-4">
                        <Label className="font-semibold text-lg">Lampiran: </Label>
                        {(selectedData && selectedData?.nama_file !== "" && selectedData.url_file !== "")
                            ? (
                                <a
                                    href={`${selectedData.url_file.replace(/\\/g, '')}`}
                                    target="_blank"
                                    className={cn(
                                        'inline',
                                        buttonVariants({ size: 'sm' })
                                    )}
                                >
                                    <DownloadCloud className='w-5 h-5 me-1' />
                                    {selectedData.nama_file}
                                </a>
                            ) : (
                                <span className="text-xs text-red-400">Tidak ditemukan lampiran</span>
                            )}
                    </div>
                </div>
            </div>
            <div className="absolute h-[60px] md:h-[70px] bg-gradient-to-r from-cyan-500/25 to-blue-500/50 w-full bottom-0 right-0 space-x-2 flex justify-end items-center p-3 pe-8 z-10">
                <Link
                    href={`./`}
                    className={cn(
                        buttonVariants({ variant: 'outline' })
                    )}
                >
                    {isLocked ? 'Tutup' : 'Kembali'}
                </Link>
                {!isLocked && (
                    <Button className="text-white" onClick={onSubmitVerifikasi}>
                        {isSubmitting && (
                            <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                        )}
                        Simpan
                    </Button>
                )}
            </div>
        </div>
    )
}

export default Detail