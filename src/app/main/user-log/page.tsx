/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { NextPage } from "next";
import style from './index.module.css'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { QueryParams, buildQueryParam, isLastPage } from "../../../../../helper";
import {  Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { UserLogI } from "../../../../services/types";
import { QueryParams, buildQueryParam, isLastPage, useDebounce } from "../../../../helper";
import { getAllUserLog } from "../../../../services";
import { context } from "../../../../store";
import DatePicker from "@/components/tools/date-picker";
import { Input } from "@/components/ui/input";
import { PaginationI } from "@/lib/types";
import Paginator from "@/components/tools/paginator";

const UserLog:NextPage = ()=>{
    const router = useRouter()
    const ctx = context()
    const [page, setPage] = useState<number>(1);
    const pageSize:number = 10;
    const [offset,setOffset] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [dataSource, setDataSource] = useState<UserLogI[]>()
    const [date, setDate] = useState<string>('')
    const [searchTerm, setSearchTerm] = useState<string>(''); // State for search term
    const [pagination, setPagination] = useState<PaginationI>({
        currentPage: 1,
        totalPages: 0,
        startItem: 0,
        endItem: 0,
        total_data: 0
    })

    
    const firstInit = async()=> {
        fetchData(page, date);
    }
    useEffect(()=>{
        firstInit()
    },[])
    
    //Hit every 60 seconds
    useEffect(() => {
        firstInit();
        const interval = setInterval(() => {
            fetchData(page, date);
        }, 60000); // 60000ms = 1 minute

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [page, date]);

    const fetchData = async(pagination=1, search='') => {
        setIsLoading(true)
        const tempParams: QueryParams = {};

        if (search && search != ""){
            tempParams.search = search
        }
        const offset = (pagination - 1) * pageSize
        tempParams.offset = offset.toString()
        tempParams.limit = pageSize.toString()
        const params = buildQueryParam(tempParams) || '';
        if (offset < 0)return
        await getAllUserLog(router, params)
        .then((res)=> {
            setDataSource(res.data.data)
            setOffset(parseInt((res.data as any).offset) || 0)
            const { 
                offset,
                limit,
                total_data 
              } = (res.data as any);
              const currentPage:number = Math.floor(offset / limit) + 1;
              const totalPages:number = Math.ceil(total_data / limit);
              const startItem:number = parseInt(offset) + 1;
              const endItem:number = Math.min(parseInt(offset) + parseInt(limit), total_data);
              setPagination({
                currentPage,
                totalPages,
                startItem,
                endItem,
                total_data
              })
        })
        .catch((res)=> {
            console.log(res);
        })
        .finally(()=> {
            setIsLoading(false)
        })
    }

    const handleSearchDebounced = useDebounce(
        // Fungsi pencarian yang akan dipanggil dengan debounce
        (searchTerm) => {
          fetchData(1,searchTerm);
        },
        // Nilai-nilai yang ingin dijadikan argumen untuk fungsi pencarian
        [searchTerm],
        // Waktu penundaan sebelum menjalankan fungsi pencarian (dalam milidetik)
        500 // Misalnya, setelah pengguna selesai mengetik selama 500ms, pencarian akan dipicu
      );
    

    const handleNextClick = () => {
        setPage(page+1)
        fetchData(page + 1, date);
    };
    const handlePreviousClick = () => {
        setPage(page-1)
        fetchData(page - 1, date);
    };

    return(
        <div className="px-3 lg:px-7 mt-5">
             
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 w-full lg:w-auto">
                <Input
                    placeholder="Filter"
                    value={(searchTerm)}
                    onChange={(event) =>{
                        setSearchTerm(event.target.value)
                        handleSearchDebounced
                    }}
                    className="max-w-sm"
                />
               
            </div>
            <h1 className="text-center my-7 md:my-3 font-bold text-4xl md:text-3xl w-fit mx-auto">
              USER LOG
            </h1>
            <div className={`relative overflow-x-scroll`}>
                <table className={style.table}>
                    <thead className="[&:nth-child(3):bg-red-900]">
                        {/* First row of header group */}
                        <tr>
                            <th>No</th>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Aktivitas</th>
                            <th>Modul</th>
                        </tr>
                    </thead>
                    <tbody>
                        { dataSource && dataSource.length > 0 ? (dataSource?.map((data,key)=>(
                            <tr key={key}>
                                <td>{offset + key + 1}</td>
                                <td>{data.timestamp}</td>
                                <td>{data.nama_user}</td>
                                <td>{data.aktifitas}</td>
                                <td>{data.modul}</td>
                            </tr>
                        ))) : (
                            <tr className="text-center w-full">
                                <td colSpan={11} className="h-24">
                                    {isLoading ? '' : 'Data tidak ditemukan'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {isLoading && (
                    <div className="fixed md:absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                        <Loader2 className="mr-2 h-8 w-8 animate-spin"/>
                    </div>
                )}
            </div>
            <div className="flex lg:flex-row flex-col items-center lg:justify-between py-2 px-2 lg:px-4 rounded-t-md overflow-x-scroll pb-5 mt-2 lg:pb-2">
                <Paginator
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={(pageNumber) => {
                    fetchData(pageNumber)
                    }}
                    showPreviousNext
                    // isLoading={isLoading}
                />
                <div className="pagination-summary text-[9px] lg:text-xs items-center w-full lg:w-auto mt-2 md:mt-0 text-center">
                    Menampilkan <span className="font-bold">{pagination.startItem}-{pagination.endItem}</span> dari <span className="font-bold">{pagination.total_data}</span> item.
                </div>
            </div>
        </div>
    )
}
export default UserLog