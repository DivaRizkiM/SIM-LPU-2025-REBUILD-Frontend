"use client"
import { useEffect, useState } from "react";
import {  columns } from "./columns";
import { DataTable } from "./data-table";

import { useRouter } from "next/navigation";
import { IRekonsiliasi } from "../../../../../services/types";
import { getRekonsiliasi } from "../../../../../services";


export default function Rekonsiliasi() {
    const [dataSource, setDataSource] = useState<IRekonsiliasi[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [grandTotal, setGrandTotal] = useState<string>("")
    const router = useRouter()
    
    const firstInit = async()=> {
      setIsLoading(true)
      await getRekonsiliasi(router,'?limit=99999')
        .then((res)=> {
          setDataSource(res.data.data)
          setGrandTotal(res.data.grand_total || '')
        })
        .catch(()=> {

        })
        .finally(()=>{
          setIsLoading(false)
        })
    }
    useEffect(()=>{
      firstInit()
      /* eslint-disable react-hooks/exhaustive-deps */
    },[])


    return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">Rekonsiliasi</h3>
        <DataTable 
          columns={columns} 
          data={dataSource} 
          isLoading={isLoading}
          fetchData={firstInit}
        />
        {/* <footer className="absolute h-[40px] bg-gradient-to-r from-cyan-300 to-blue-100 dark:from-cyan-500/25 dark:to-blue-900/50 w-full bottom-0 right-0 space-x-2 flex justify-end items-center p-1 pe-8 text-sm">
          <Calculator className="h-4 w-4 me-1"/>
          Grand Total :  {grandTotal}
        </footer> */}
    </div>
    )
}