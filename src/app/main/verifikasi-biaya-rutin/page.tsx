"use client"
import { useState } from "react";
import { VerifikasiRutinI, columns } from "./columns";
import { DataTable } from "./data-table";
import { getBiayaRutin } from "../../../../services";
import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";
import { QueryParams, buildQueryParam } from "../../../../helper";
import { toast } from "@/components/ui/use-toast";
import useSWR from 'swr'

export default function VerifikasiBiayaRutin() {
  const router = useRouter()
  const [queryParams, setQueryParams] = useState<string>('')

  const { data, error, isLoading } = useSWR(
    ['VerifikasiBiayaRutin',queryParams ? queryParams : '?'],
    (key) => fetcher(key[1])
  );
  const dataSource: VerifikasiRutinI[] = data?.data || [];
  const grandTotal: string = data?.grand_total || "";
  
  const fetcher = async (params: string) => {
    try {
      const response = await getBiayaRutin(router, params);
      return response.data;
    } catch (err: any) {
      toast({
        title: err.response?.data?.message || err.message,
        variant: "destructive",
      });
      throw err;
    }
  };
  
  
  const firstInit = async (
    tahun = "",
    triwulan = "",
    status: "7" | "9" | string = "",
    search = ""
  ) => {

    const tempParams: QueryParams = {};
    if (tahun && tahun !== "all") tempParams.tahun = tahun;
    if (triwulan && triwulan !== "all") tempParams.triwulan = triwulan;
    if (status && status !== "all") tempParams.status = status;
    if (search) tempParams.search = search;

    const params = buildQueryParam(tempParams) || "";
    setQueryParams(params)
  };

  if (error){
    toast({
      title: error?.message || 'Something wrong..',
      variant: 'destructive'
    })
  }

  return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
          VERIFIKASI BIAYA RUTIN
        </h3>
        <DataTable 
          columns={columns} 
          data={dataSource} 
          isLoading={isLoading}
          fetchData={firstInit}
        />
        <footer className="absolute backdrop-blur z-0 h-[40px] bg-primary/70 w-full bottom-0 right-0 space-x-2 flex justify-end items-center p-1 pe-8 text-sm">
          <Calculator className="h-4 w-4 me-1"/>
          Grand Total :  <span className="font-bold">{grandTotal}</span>
        </footer>
    </div>
  )
}