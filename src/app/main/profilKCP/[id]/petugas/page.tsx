"use client"
import { useEffect, useState } from "react";
import { PetugasKPC, columns } from "./columns";
import { DataTable } from "./data-table";

import { useParams, useRouter } from "next/navigation";
import { getPetugasbyKpc } from "../../../../../../services";


export default function BiayaNppNasional() {
    const [dataSource, setDataSource] = useState<PetugasKPC[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()
    const params = useParams<{id:string}>()
    
    const firstInit = async()=> {
      setIsLoading(true)
      try {
        const res = await getPetugasbyKpc(router,params.id)
        setDataSource(res.data.data)
        
      } catch (error) {
        console.log('Err: ',error);
        
      } finally {
        setIsLoading(false)
      }
    }
    useEffect(()=>{
      firstInit()
      /* eslint-disable react-hooks/exhaustive-deps */
    },[])


    return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
          Profil KCP - Petugas
        </h3>
        <DataTable 
          columns={columns} 
          data={dataSource} 
          isLoading={isLoading}
          fetchData={firstInit}
        />
    </div>
    )
}