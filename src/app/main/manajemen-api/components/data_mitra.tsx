'use client'

import Combobox from "@/components/tools/combobox"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { context } from "../../../../../store"
import { FormCustomOption } from "../../../../../store/state"
import { RegionalI } from "../../referensi/regional/columns"
import { getRegional, syncMitraLpu } from "../../../../../services"
import { buildQueryParam, QueryParams, stringifyError } from "../../../../../helper"

export function DataMitraLpu() {
  const router = useRouter()
  const ctx = context()

  const [regional, setRegional] = useState<string>("")
  const [regionalOptions, setRegionalOptions] = useState<Array<FormCustomOption>>([])
  const [isRegionalLoading,setIsRegionalLoading] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const firstInit = async()=> {
    setIsRegionalLoading(true)
    try {
      const res = await getRegional(router,'?limit=99')
      const opts = res.data.data.map((it:RegionalI)=>({
        value: it.id.toString(),
        label: it.nama
      }))
      setRegionalOptions(opts)
    } catch (e) {
      console.log(e)
    } finally {
      setIsRegionalLoading(false)
    }
  }

  useEffect(()=>{ firstInit() },[])

  const onSync = async()=> {
    setIsLoading(true)
    try {
      const qp: QueryParams = { id_regional: regional }
      const params = buildQueryParam(qp) || ''
      const res = await syncMitraLpu(router, params)
      toast({ title: res.data?.message || 'Sinkronisasi Mitra LPU dijalankan' })
    } catch (error:any) {
      toast({
        title: error.response?.data 
          ? stringifyError(error.response?.data.message)
          : error.message,
        variant: 'destructive'
      })
    } finally {
      setTimeout(()=>setIsLoading(false), 500)
    }
  }

  const onClickSync = ()=> {
    if(!regional){
      toast({ title: 'Pilih Regional dulu', variant: 'destructive' })
      return
    }
    ctx.dispatch({
      alertDialog: {
        title: `Apakah anda yakin ingin menyinkronkan Mitra LPU untuk regional terpilih?`,
        type: 'sync',
        onSubmit: async()=> { await onSync() }
      }
    })
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-sky-300 dark:bg-sky-950 mb-5">
        <CardTitle>Mitra LPU (per Regional)</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label>Regional*</Label>
          <Combobox 
            options={regionalOptions}
            placeholder="Pilih Regional"
            value={regional}
            onSelect={(e)=>setRegional(e)}
            isLoading={isRegionalLoading}
            disabled={regionalOptions.length === 0}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={"secondary"} onClick={onClickSync}>
          <RefreshCcw className={cn(`mr-2 w-4 h-4`,isLoading && 'animate-spin')}/>
          Sinkronisasi
        </Button>
      </CardFooter>
    </Card>
  )
}
