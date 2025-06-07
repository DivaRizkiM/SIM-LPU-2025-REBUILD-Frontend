"use client"
import { useState } from "react";
import {  columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter } from "next/navigation";
import { ITargetAnggaran } from "../../../../../services/types";
import { getTargetAnggaran } from "../../../../../services";
import useSWR from "swr";
import { toast } from "@/components/ui/use-toast";

export default function TargetAnggaran() {
    const router = useRouter()

    const { data, error, isLoading,mutate } = useSWR(
      ['target-anggaran','?limit=9999'],
      (key) => fetcher(key[1])
    );
    console.log('Target anggaran: ');
    console.log({data});
    
    const dataSource: ITargetAnggaran[] = data || [];
    
    const fetcher = async (params: string) => {
      try {
        const response = await getTargetAnggaran(router, params);
        return response.data.data;
      } catch (err: any) {
        toast({
          title: err.response?.data?.message || err.message,
          variant: "destructive",
        });
        throw err;
      }
    };
    
    
    const firstInit = async () => {
      return mutate()
    };

    if (error){
      toast({
        title: error?.message || 'Something wrong..',
        variant: 'destructive'
      })
    }

    return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">Target Anggaran</h3>
        <DataTable 
          columns={columns} 
          data={dataSource || []}
          isLoading={isLoading}
          fetchData={firstInit}
        />
    </div>
    )
}