"use client"
import { useEffect, useState } from "react";
import { ProvinsiI, columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter } from "next/navigation";
import { getPenyelenggara } from "../../../../../services";

export default function Kelurahan() {
  const [dataSources, setDataSources] = useState<ProvinsiI[]>([])
  const router = useRouter()
  
  const firstInit = async()=> {
    try {
      await getPenyelenggara(router,'?limit=67000')
      .then((res)=>{
        setDataSources(res.data.data)
      })
    } catch (error) {
      console.log('Err: ',error);
    }
  }
  useEffect(()=>{
    firstInit()
    /* eslint-disable react-hooks/exhaustive-deps */
  },[])

    return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">Nama Penyelenggara</h3>
        <DataTable columns={columns} data={dataSources}  fetchData={firstInit}/>
    </div>
    )
}