"use client"
import { useState } from "react";
import { BiayaNppNasionalI, columns } from "./columns";
import { DataTable } from "./data-table";
import { getNppNasional } from "../../../../services";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Calculator } from "lucide-react";
import { QueryParams, buildQueryParam } from "../../../../helper";
import useSWR from "swr";


export default function BiayaNppNasional() {
  const router = useRouter()
  const [queryParams, setQueryParams] = useState<string>('')

  const { data, error, isLoading } = useSWR(
    ['BiayaNppNasional',queryParams ? queryParams : '?'],
    (key) => fetcher(key[1]) 
  );
  const dataSource: BiayaNppNasionalI[] = data?.data || [];
  const grandTotal: string = data?.grand_total || "";

    const fetcher = async (params: string) => {
      try {
        const response = await getNppNasional(router, params);
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
      bulan = "",
    ) => {
  
      const tempParams: QueryParams = {};
      if (tahun && tahun !== "all") tempParams.tahun = tahun;
      if (bulan && bulan !== "all") tempParams.bulan = bulan;
  
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
          BIAYA NPP NASIONAL
        </h3>
        <DataTable 
          columns={columns} 
          data={dataSource || []}
          isLoading={isLoading}
          fetchData={firstInit}
        />
        <footer className="absolute h-[40px] backdrop-blur bg-primary/70 w-full bottom-0 right-0 space-x-2 flex justify-end items-center p-1 pe-8 text-sm">
          <Calculator className="h-4 w-4 me-1"/>
          Grand Total :  <span className="font-bold">{grandTotal}</span>
        </footer>
    </div>
    )
}