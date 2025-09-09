"use client"
import { useEffect, useState } from "react";
import { RekeningProduksiI, columns } from "./columns";
import { DataTable } from "./data-table";
import { getJenisBisnis } from "../../../../../services";
import { useRouter } from "next/navigation";

export default function JenisBisnis() {
    const [dataSources, setDataSources] = useState<RekeningProduksiI[]>([])
    const router = useRouter()

    const firstInit = ()=> {
      try {
        getJenisBisnis(router,'?limit=9999')
        .then((res)=>{
          setDataSources(res.data.data)
        })
      } catch (error) {
        console.log('Err: ',error);
      }
    }
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(firstInit,[])


    return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">Tipe Bisnis</h3>

            <DataTable columns={columns} data={dataSources} />

    </div>
    )
}