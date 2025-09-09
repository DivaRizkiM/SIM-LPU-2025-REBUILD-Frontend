"use client"
import { useEffect, useMemo, useState } from "react";
import { KelurahanI, columns } from "./columns";
import { DataTable } from "./data-table";
import { useRouter } from "next/navigation";
import { getKelurahan } from "../../../../../services";
import { toast } from "@/components/ui/use-toast";
import { PaginationI } from "@/lib/types";

export default function Kelurahan() {
  const router = useRouter()
  const [dataSources, setDataSources] = useState<KelurahanI[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [pagination, setPagination] = useState<PaginationI>({
    currentPage: 1,
    totalPages: 0,
    startItem: 0,
    endItem: 0,
    total_data: 0
  })
  const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
  const pageSize = 10;
  
  const firstInit = async()=> {
    setIsLoading(true)
    try {
     await fetchData(pagination.currentPage,searchTerm)
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


 // Function to fetch data from the endpoint with pagination and filtering
 const fetchData = async (page: number=pagination.currentPage, search: string=searchTerm): Promise<void> => {
    const offset = (page - 1) * pageSize;
    const url = `?offset=${offset}&limit=${pageSize}&search=${search}`;
    if (offset < 0)return
    try {
      const response = await getKelurahan(router, url);
      const { 
        offset,
        limit,
        total_data 
      } = (response.data as any);
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
      setDataSources(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDataSources([]);
      toast({
        title: 'Ada kesalahan',
        variant: 'destructive'
      })
    }
  };


  

    return(
    <div className="px-2 md:px-4 py-1 md:py-2">
        <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">Kelurahan</h3>
        <DataTable 
          columns={columns} 
          data={dataSources} 
          fetchData={fetchData} 
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          pagination={pagination}
          />
    </div>
    )
}