"use client"

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { getBiayaRutinKPC } from "../../../../../services";
import useSWR from "swr";
import { toast } from "@/components/ui/use-toast";

const fetcher = async (url: string, router: any) => {
  const response = await getBiayaRutinKPC(router, url);
  return response.data.data;
};

export default function VerifikasiKPRK() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tahun = searchParams.get('tahun')
  const id_kcu = searchParams.get('kcu_id')
  const triwulan = searchParams.get('triwulan')

  // Build the query params
  const queryParams = `?tahun=${tahun}&id_kcu=${id_kcu}&triwulan=${triwulan}`;
    
  // Use SWR for data fetching
  const { data: dataSource, error, isLoading } = useSWR(
    queryParams ? [queryParams, router] : null,
    ([url, router]) => fetcher(url, router)
  );

  if (error) {
    console.error("Error fetching data:", error);
    toast({
      title: error?.message || 'Something wrong..',
      variant: 'destructive'
    })
  }

  return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
          VERIFIKASI BIAYA RUTIN / VERIFIKASI KCP
        </h3>
          <DataTable 
            columns={columns}
            data={dataSource || []} 
            isLoading={isLoading}
          />

    </div>
  )
}