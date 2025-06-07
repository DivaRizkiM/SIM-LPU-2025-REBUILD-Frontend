"use client"
import { useEffect, useState } from "react";
import { ProvinsiI, columns } from "./columns";
import { DataTable } from "./data-table";
import { getProvinsi } from "../../../../../services";
import { useRouter } from "next/navigation";


export default function Provinsi() {
    const [dataSources, setDataSources] = useState<ProvinsiI[]>([])
    const router = useRouter()
    
    const firstInit = ()=> {
      try {
        getProvinsi(router,'?limit=9999')
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
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">Provinsi</h3>
        <DataTable columns={columns} data={dataSources} fetchData={firstInit}/>
    </div>
    )
}