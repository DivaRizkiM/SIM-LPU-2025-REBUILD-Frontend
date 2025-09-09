"use client"
import { useEffect, useState } from "react";
import { KabKotaI, columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter } from "next/navigation";
import { getKabKota } from "../../../../../services";
import { PaginationI } from "@/lib/types";


export default function KabupatenKota() {
  const [dataSources, setDataSources] = useState<KabKotaI[]>([])
  const [pagination, setPagination] = useState<PaginationI>({
    currentPage: 1,
    totalPages: 0,
    startItem: 0,
    endItem: 0,
    total_data: 0
  })
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const pageSize = 10;
  
  const router = useRouter()
  
  const firstInit = async(page: number=pagination.currentPage, search: string=searchTerm)=> {
    const offset = (page - 1) * pageSize;
    const url = `?offset=${offset}&limit=${pageSize}&search=${search}`;
    if (offset < 0)return
    try {
      await getKabKota(router,url)
      .then((res)=>{
        const { 
          offset,
          limit,
          total_data 
        } = (res.data as any);
        const currentPage:number = Math.floor(offset / limit) + 1;
        const totalPages:number = Math.ceil(total_data / limit);
        const startItem:number = parseInt(offset) + 1;
        const endItem:number = Math.min(offset + limit, total_data);

        setPagination({
          currentPage,
          totalPages,
          startItem,
          endItem,
          total_data
        })
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
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">Kabupaten/Kota</h3>

            <DataTable 
              columns={columns} 
              data={dataSources} 
              fetchData={firstInit}
              pagination={pagination}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

    </div>
    )
}