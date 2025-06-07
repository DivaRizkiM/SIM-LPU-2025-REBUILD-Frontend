"use client"

import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { getBiayaAtribusiKCU } from "../../../../../services";
import useSWR from "swr";
import { toast } from "@/components/ui/use-toast";

const fetcher = async (url: string, router: any) => {
  const response = await getBiayaAtribusiKCU(router, url);
  return response.data.data; // Adjust based on the structure of the API response
};

export default function VerifikasiAtribusiDetail() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const ba_id = searchParams.get('ba_id')
    const kcu_id = searchParams.get('kcu_id')

    // Build the query params
    const queryParams = `?id_biaya_atribusi=${ba_id}&id_kcu=${kcu_id}`;

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
          VERIFIKASI BIAYA ATRIBUSI
        </h3>
        <DataTable 
          columns={columns} 
          data={dataSource || []} 
          isLoading={isLoading}
        />
    </div>
    )
}