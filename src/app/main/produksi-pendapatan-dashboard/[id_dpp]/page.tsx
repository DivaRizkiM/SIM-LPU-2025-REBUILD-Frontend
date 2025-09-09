'use client'
import { NextPage } from "next";
import { getDetailProduksiPendapatan, postVerifikasiProduksiPendapatan } from "../../../../../services";
import { useParams, useRouter } from "next/navigation";
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
import { IFormProduksiPendapatanVerifikasi, ProduksiPendapatanI } from "../../../../../services/types";
import { ReloadIcon } from "@radix-ui/react-icons"
import { DownloadCloud, Loader2 } from "lucide-react";


const Detail: NextPage = () => {
    const router = useRouter()
    const params = useParams<{ id_dpp: string }>()
    const [Datasource, setDataSource] = useState<Array<ProduksiPendapatanI>>([])
    const [selectedID, setSelectedID] = useState<string>('')
    const [indexSelected, setIndexSelected] = useState<number>(0)
    const [selectedData, setSelectedData] = useState<ProduksiPendapatanI>()
    const [animateTrigger, setAnimateTrigger] = useState<boolean>(false)
    const [dataVerifications, setDataVerifications] = useState<Array<IFormProduksiPendapatanVerifikasi>>([])
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const firstInit = async () => {
        const payload = `?id_dpp=${params.id_dpp}`
        setIsLoading(true)
        await getDetailProduksiPendapatan(router, payload)
            .then((res) => {
                const dataResponse: ProduksiPendapatanI[] = res.data.data
                if (((res.data as any).isLock)) {
                    router.push(`./`)
                }
                setDataSource(dataResponse)
                const dataEarlier: ProduksiPendapatanI = dataResponse[0]
                setSelectedID(dataEarlier.id.toString())
                setSelectedData(dataEarlier)

                const tempDataVerifs: IFormProduksiPendapatanVerifikasi[] = dataResponse.map((data) => {
                    return {
                        id_dpp: data.id,
                        verifikasi_jumlah_produksi: data.verifikasi_jumlah_produksi,
                        verifikasi_jumlah_pendapatan: cleanCurrencyFormat(data.verifikasi_jumlah_pendapatan),
                        verifikasi_koefisien: data.verifikasi_koefisien,
                        catatan_pemeriksa: data.catatan_pemeriksa,
                        isProduksiSesuai: data.verifikasi_jumlah_produksi === "0" ? "" : (data.verifikasi_jumlah_produksi === data.jumlah_produksi ? "1" : '0'),
                        isKoefisienSesuai: data.verifikasi_koefisien === "0" ? "" : (data.verifikasi_koefisien === data.koefisien ? "1" : '0')
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

    const onClickPagination = (data: ProduksiPendapatanI, index: number) => {
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

            if (eventName === "verifikasi_jumlah_produksi") {
                const formattedValue = formatCurrency(value);
                tempData[indexSelected] = {
                    ...tempData[indexSelected],
                    verifikasi_jumlah_produksi: formattedValue,
                }
            } else {
                tempData[indexSelected] = {
                    ...tempData[indexSelected],
                    [eventName]: value
                }
            }
            setDataVerifications(tempData)
        }
    }

    const selectHandler = (val: "0" | "1") => {
        const tempData = [...dataVerifications]
        if (val === "1") {
            tempData[indexSelected].verifikasi_jumlah_produksi = selectedData?.jumlah_produksi || ''
        } else {
            tempData[indexSelected].verifikasi_jumlah_produksi = ""
        }
        tempData[indexSelected].isProduksiSesuai = val
        setDataVerifications(tempData)
    }
    const selectKoefisienHandler = (val: "0" | "1") => {
        const tempData = [...dataVerifications]
        if (val === "1") {
            tempData[indexSelected].verifikasi_koefisien = selectedData?.koefisien || ''
        } else {
            tempData[indexSelected].verifikasi_koefisien = ""
        }
        tempData[indexSelected].isKoefisienSesuai = val
        setDataVerifications(tempData)
    }

    const onSubmitVerifikasi = async () => {
        setIsSubmitting(true)
        const tempData: IFormProduksiPendapatanVerifikasi[] = dataVerifications.map((data) => {
            return {
                id_dpp: data.id_dpp.toString(),
                verifikasi_jumlah_produksi: data.verifikasi_jumlah_produksi.toString(),
                verifikasi_jumlah_pendapatan: data.verifikasi_jumlah_pendapatan.toString(),
                catatan_pemeriksa: data.catatan_pemeriksa?.toString(),
                verifikasi_koefisien: data.verifikasi_koefisien.toString()
            }
        })
        const payload = {
            data: tempData
        }
        await postVerifikasiProduksiPendapatan(router, selectedID, payload)
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

    const checkVerifSync = (verifikasiProduksi: string, jumlahProduksi: string) => {
        switch (verifikasiProduksi) {
            case '0':
                return 'outline'
            case jumlahProduksi:
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
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">VERIFIKASI PRODUKSI PENDAPATAN - DETAIL</h3>
            <div className="flex space-x-2 h-full">
                <ul className="relative space-y-2 text-center w-14  md:w-16 max-h-svh overflow-y-scroll z-20">
                    {Datasource.map((data, key) => (
                        <li key={key}>
                            <Button
                                size={"default"}
                                variant={
                                    data?.id.toString() === selectedID
                                        ? 'default'
                                        : checkVerifSync(dataVerifications[key].verifikasi_jumlah_produksi, data.jumlah_produksi)
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
                                <Label>Tahun</Label>
                                <Input value={selectedData?.tahun} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Nama Grup Produk</Label>
                                <Input value={selectedData?.nama_group_produk} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Bisnis</Label>
                                <Input value={selectedData?.bisnis} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Jumlah Produksi</Label>
                                <Input value={selectedData?.jumlah_produksi} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Jumlah Pendapatan</Label>
                                <Input value={selectedData?.jumlah_pendapatan} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Koefisien</Label>
                                <Input value={selectedData?.koefisien} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Transfer Pricing</Label>
                                <Input value={selectedData?.transfer_pricing} className="w-full col-span-3 bg-secondary" readOnly />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <div>
                                    <Label>Pilih Kondisi*</Label>
                                    {!dataVerifications[indexSelected]?.isProduksiSesuai && (
                                        <div className="text-xs text-red-600">Wajib diisi</div>
                                    )}
                                </div>
                                <div className="w-full col-span-3">
                                    <Select
                                        value={dataVerifications[indexSelected]?.isProduksiSesuai}
                                        onValueChange={selectHandler}
                                    >
                                        <SelectTrigger
                                            className={!dataVerifications[indexSelected]?.isProduksiSesuai ? 'border-red-600' : ''}
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
                                    <Label>Verifikasi Jumlah Produksi*</Label>
                                    {dataVerifications[indexSelected]?.verifikasi_jumlah_produksi === "" && (
                                        <div className="text-xs text-red-600">Wajib diisi</div>
                                    )}
                                </div>
                                <Input
                                    value={dataVerifications[indexSelected]?.verifikasi_jumlah_produksi}
                                    name="verifikasi_jumlah_produksi"
                                    className={`
                                        w-full col-span-3 
                                        ${dataVerifications[indexSelected]?.isProduksiSesuai === "1" || dataVerifications[indexSelected]?.isProduksiSesuai === "" ? "bg-secondary" : ''}
                                        ${dataVerifications[indexSelected]?.verifikasi_jumlah_produksi === "" ? 'border-red-600' : ''}
                                    `}
                                    readOnly={dataVerifications[indexSelected]?.isProduksiSesuai === "1" || dataVerifications[indexSelected]?.isProduksiSesuai === ""}
                                    onChange={handleInput}
                                />
                            </div>
                            <div className="grid gap-2 md:grid-cols-4 items-center">
                                <Label>Verifikasi Jumlah Pendapatan</Label>
                                <CurrencyInput
                                    value={formatCurrency(dataVerifications[indexSelected]?.verifikasi_jumlah_pendapatan || "0")}
                                    className="w-full col-span-3 bg-secondary"
                                    readOnly
                                />
                            </div>

                            <div className="grid gap-2 md:grid-cols-4 items-center pt-4">
                                <div>
                                    <Label>Pilih Kondisi*</Label>
                                    {!dataVerifications[indexSelected]?.isKoefisienSesuai && (
                                        <div className="text-xs text-red-600">Wajib diisi</div>
                                    )}
                                </div>
                                <div className="w-full col-span-3">
                                    <Select
                                        value={dataVerifications[indexSelected]?.isKoefisienSesuai}
                                        onValueChange={selectKoefisienHandler}
                                    >
                                        <SelectTrigger
                                            className={!dataVerifications[indexSelected]?.isKoefisienSesuai ? 'border-red-600' : ''}
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
                                    <Label>Verifikasi Koefisien*</Label>
                                    {dataVerifications[indexSelected]?.verifikasi_koefisien === "" && (
                                        <div className="text-xs text-red-600">Wajib diisi</div>
                                    )}
                                </div>
                                <Input
                                    value={dataVerifications[indexSelected]?.verifikasi_koefisien}
                                    name="verifikasi_koefisien"
                                    className={`
                                        w-full col-span-3 
                                        ${dataVerifications[indexSelected]?.isKoefisienSesuai === "1" || dataVerifications[indexSelected]?.isKoefisienSesuai === "" ? "bg-secondary" : ''}
                                        ${dataVerifications[indexSelected]?.verifikasi_koefisien === "" ? 'border-red-600' : ''}
                                    `}
                                    readOnly={dataVerifications[indexSelected]?.isKoefisienSesuai === "1" || dataVerifications[indexSelected]?.isKoefisienSesuai === ""}
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
                    Kembali
                </Link>
                <Button className="text-white" onClick={onSubmitVerifikasi}>
                    {isSubmitting && (
                        <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    Simpan
                </Button>
            </div>
        </div>
    )
}

export default Detail