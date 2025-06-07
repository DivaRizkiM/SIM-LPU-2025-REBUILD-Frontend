"use client"

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { getVerifikasiProduksiByKCP } from "../../../../../services";
import useSWR from "swr";
import { toast } from "@/components/ui/use-toast";

const fetcher = async (url: string, router: any) => {
  const response = await getVerifikasiProduksiByKCP(router, url);
  return response.data.data; // Adjust based on the structure of the API response
};

export default function VerifikasiAtribusiDetail() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id_produksi = searchParams.get('id_produksi')
    const kcu_id = searchParams.get('kcu_id')
    const id_kpc = searchParams.get('id_kpc')

    // Build the query params
    const queryParams = `?id_produksi=${id_produksi}&id_kcu=${kcu_id}&id_kpc=${id_kpc}`;
    
    // Use SWR for data fetching
    const { data: dataSource, error, isLoading, mutate } = useSWR(
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
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">VERIFIKASI PRODUKSI - PELAPORAN</h3>
        <DataTable 
          columns={columns} 
          data={dataSource || []}
          isLoading={isLoading}
          mutate={mutate}
        />
    </div>
    )
}