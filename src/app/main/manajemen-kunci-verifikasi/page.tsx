"use client"
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter } from "next/navigation";
import { getLockVerifikasi } from "../../../../services";
import { LockVerifikasiI } from "../../../../services/types";


export default function ManajemenKunciVerifikasi() {
    const [dataSources, setDataSources] = useState<Array<LockVerifikasiI>>([])
    const router = useRouter()
    
    const firstInit = ()=> {
      try {
        getLockVerifikasi(router,'?limit=9999')
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
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">Manajemen Kunci Verifikasi</h3>
        <DataTable columns={columns} data={dataSources} fetchData={firstInit}/>
    </div>
    )
}