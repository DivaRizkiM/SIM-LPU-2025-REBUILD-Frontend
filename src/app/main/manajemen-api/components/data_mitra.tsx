"use client"

import Combobox from "@/components/tools/combobox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { getKPRK, getKpcByKcu, getRegional, syncMitraLpu } from "../../../../../services"
import { useRouter } from "next/navigation"
import { FormCustomOption } from "../../../../../store/state"
import { RegionalI } from "../../referensi/regional/columns"
import { kcuI } from "../../referensi/kc-kcu/columns"
import { ProfilKcpI } from "../../profilKCP/columns"
import { RefreshCcw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { buildQueryParam, stringifyError } from "../../../../../helper"
import { context } from "../../../../../store"

export function DataMitra() {
  const router = useRouter()
  const ctx = context()

  const [regional, setRegional] = useState<string>("")
  const [regionalOptions, setRegionalOptions] = useState<FormCustomOption[]>([])
  const [isRegionalLoading, setIsRegionalLoading] = useState<boolean>(false)

  const [tempKcu, setTempKcu] = useState<kcuI[]>([])
  const [kcuOptions, setKcuOptions] = useState<FormCustomOption[]>([])
  const [kcu, setKcu] = useState<string>("")
  const [isKcuLoading, setIsKcuLoading] = useState<boolean>(false)

  const [kcp, setKcp] = useState<string>("")
  const [kcpOptions, setKcpOptions] = useState<FormCustomOption[]>([])
  const [isKcpLoading, setIsKcpLoading] = useState<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const firstInit = async () => {
    setIsRegionalLoading(true)
    try {
      const [regionalRes, kcuRes] = await Promise.all([
        getRegional(router, "?limit=999"),
        getKPRK(router, "?limit=999"),
      ])

      const regionals = regionalRes.data.data.map((item: RegionalI) => ({
        value: item.id.toString(),
        label: item.nama,
      }))

      setRegionalOptions(regionals)
      setTempKcu(kcuRes.data.data)
    } catch (err) {
      console.log("Err: ", err)
    } finally {
      setIsRegionalLoading(false)
    }
  }

  useEffect(() => {
    firstInit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getKcuByRegional = async (id: string | number) => {
    setIsKcuLoading(true)
    try {
      const filtered: kcuI[] = tempKcu.filter((i) => i.id_regional.toString() === id.toString())
      const options = filtered.map((i) => ({ value: i.id.toString(), label: i.nama }))
      setKcuOptions(options)
      setKcu("")
      setKcp("")
      setKcpOptions([])
    } catch (error) {
      console.log("Err: ", error)
    } finally {
      setTimeout(() => setIsKcuLoading(false), 500)
    }
  }

  const getKpcByKcuHandler = async (id: string) => {
    setIsKcpLoading(true)
    try {
      const res = await getKpcByKcu(router, id)
      const options = res.data.data.map((i: ProfilKcpI) => ({
        // NOTE: backend sync pakai NOPEND (== id di tabel kpc)
        value: i.id?.toString() ?? i.nomor_dirian?.toString(),
        label: i.nama,
      }))
      setKcpOptions(options)
      setKcp("")
    } catch (error) {
      console.log("Err: ", error)
    } finally {
      setTimeout(() => setIsKcpLoading(false), 500)
    }
  }

  const onSync = async () => {
    if (!kcp) {
      toast({ title: "Pilih KCP terlebih dahulu", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      const params = buildQueryParam({ id_kpc: kcp }) || ""
      const res = await syncMitraLpu(router, params)

      toast({ title: res.data.message ?? "Sinkronisasi dijalankan" })
    } catch (error: any) {
      console.log("Err: ", error)
      toast({
        title: error.response?.data ? stringifyError(error.response?.data.message) : error.message,
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsLoading(false), 500)
    }
  }

  const onClickSync = () => {
    ctx.dispatch({
      alertDialog: {
        title: `Apakah anda yakin ingin menyinkronkan Mitra LPU untuk KCP terpilih?`,
        type: "sync",
        onSubmit: async () => {
          await onSync()
        },
      },
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-sky-300 dark:bg-sky-950 mb-5">
        <CardTitle>Mitra LPU</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-3">
        <Combobox
          options={regionalOptions}
          placeholder="Pilih Regional*"
          value={regional}
          onSelect={(e) => {
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
          onSelect={(e) => {
            setKcu(e)
            getKpcByKcuHandler(e)
          }}
          disabled={kcuOptions.length === 0 || isKcuLoading}
          isLoading={isKcuLoading}
        />

        <Combobox
          options={kcpOptions}
          placeholder="Pilih KCP*"
          value={kcp}
          onSelect={(e) => setKcp(e)}
          disabled={kcpOptions.length === 0 || isKcpLoading}
          isLoading={isKcpLoading}
        />
      </CardContent>

      <CardFooter>
        <Button className="w-full" variant={"secondary"} onClick={onClickSync}>
          <RefreshCcw className={cn(`mr-2 w-4 h-4`, isLoading && "animate-spin")} />
          Sinkronisasi
        </Button>
      </CardFooter>
    </Card>
  )
}
