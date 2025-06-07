"use client"
import { useEffect, useState } from "react";
import { RekeningBiayaI, columns } from "./columns";
import { DataTable } from "./data-table";
import { getRekeningBiaya } from "../../../../../services";
import { useRouter } from "next/navigation";



export default function RekeningProduksi() {
    const router = useRouter()
    const [dataSources, setDummyData] = useState<RekeningBiayaI[]>([])
 
    const firstInit = ()=> {
      try {
        getRekeningBiaya(router,'?limit=9999')
        .then((res)=>{
          setDummyData(res.data.data)
        })
      } catch (error) {
        console.log('Err: ',error);
      }
    }
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(firstInit,[])

    return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
          Rekening Biaya
        </h3>
        <DataTable columns={columns} data={dataSources} />
    </div>
    )
}