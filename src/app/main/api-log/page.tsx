/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { NextPage } from "next";
import style from './index.module.css'
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { QueryParams, buildQueryParam, isLastPage } from "../../../../../helper";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { ApiLogI } from "../../../../services/types";
import { QueryParams, buildQueryParam } from "../../../../helper";
import { getApiLog, stopSync } from "../../../../services";
import { context } from "../../../../store";
import  Modal from "./components/modal";
import DatePicker from "@/components/tools/date-picker";
import Paginator from "@/components/tools/paginator";
import { PaginationI } from "@/lib/types";

const ApiLog:NextPage = ()=>{
    const router = useRouter()
    const ctx = context()
    const [page, setPage] = useState<number>(1);
    const [pagination, setPagination] = useState<PaginationI>({
        currentPage: 1,
        totalPages: 0,
        startItem: 0,
        endItem: 0,
        total_data: 0
    })
    const pageSize:number = 10;
    const [offset,setOffset] = useState<number>(0)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [dataSource, setDataSource] = useState<ApiLogI[]>()
    const [date, setDate] = useState<string>('')
    const [stopSyncLoading, setStopSyncLoading] = useState<boolean>(false)
    
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
            fetchData(pagination.currentPage, date);
        }, 60000); // 60000ms = 1 minute

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, [page, date]);

    const fetchData = async(pagination=1, date='') => {
        setIsLoading(true)
        const tempParams: QueryParams = {};

        if (date && date != ""){
            tempParams.date = date
        }
        const offset = (pagination - 1) * pageSize
        tempParams.offset = offset.toString()
        tempParams.limit = pageSize.toString()
        const params = buildQueryParam(tempParams) || '';
        if (offset < 0)return
        await getApiLog(router, params)
        .then((res)=> {
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
          
          setDataSource(res.data.data)
          setOffset(parseInt((res.data as any).offset) || 0)
        })
        .catch((res)=> {
            console.log(res);
        })
        .finally(()=> {
            setIsLoading(false)
        })
    }

    const onClickViewHandler = (id: number)=>{
        ctx.dispatch({
            isModal: {
                title: 'Event Log',
                type: 'modal',
                fullWidth: true,
                component: <Modal id={id}/>
            }
        })
    }

    const showAlertDelete = () => {      
        ctx.dispatch({
          alertDialog: {
            type: 'stop',
            title: `Apakah anda yakin ingin memberhentikan proses sync?`,
            onSubmit: async()=>{
              await stopSyncHandler()
            }
          }
        })
      }

    const stopSyncHandler = async ()=> {
        setStopSyncLoading(true)
        await stopSync(router)
            .then((res)=>   {
                console.log('res: ',res);
            }).catch((err)=> {
                console.log('Err: ',err);
                return toast({
                  title: err.response.data.message || err.message,
                  variant: 'destructive'
                })
            })
            .finally(()=>{
                setStopSyncLoading(false)
            })
    }

    return(
        <div className="px-3 lg:px-7 mt-5">
             
            <div className="flex justify-between gap-2 w-full lg:w-auto">
                <DatePicker 
                    buttonText="Pilih Tanggal"
                />
                <Button variant={'destructive'} onClick={showAlertDelete}>
                    {stopSyncLoading ? 'Stopping...' : 'Stop Sync'}
                </Button>
            </div>
            <h1 className="text-center my-7 md:my-3 font-bold text-4xl md:text-3xl w-fit mx-auto">
              SYNC LOG
            </h1>
            <div className={`relative overflow-x-scroll text-sm`}>
                <table className={style.table}>
                    <thead className="[&:nth-child(3):bg-red-900]">
                        {/* First row of header group */}
                        <tr>
                            <th>No</th>
                            <th>Timestamp</th>
                            <th>Finished</th>
                            <th>Sync ID</th>
                            <th>IP address</th>
                            <th>Application requester</th>
                            <th>Status</th>
                            <th>Progress</th>
                            <th>Desc</th>
                            <th>Event Log</th>
                        </tr>
                    </thead>
                    <tbody>
                        { dataSource && dataSource.length > 0 ? (dataSource?.map((data,key)=>(
                            <tr key={key}>
                                <td>{offset + key + 1}</td>
                                <td>{data.tanggal}</td>
                                <td>{data.updated_at}</td>
                                <td>{data.id}</td>
                                <td>{data.ip_address}</td>
                                <td>{data.platform_request}</td>
                                <td>{data.status}</td>
                                <td className="text-xs">
                                    <div className="flex flex-col items-center">
                                        <span 
                                        className={`
                                        text-foreground/80
                                        `}> 
                                            ({data.persentase})
                                        </span>
                                        <span className="text-[9px]">
                                        &nbsp;{data.proses}
                                        </span>
                                    </div>
                                </td>
                                
                                <td>{data.komponen}</td>
                                <td>
                                    <Button 
                                        size={'sm'} 
                                        variant={"secondary"}
                                        onClick={()=>onClickViewHandler(data.id)}    
                                    >
                                        View
                                    </Button>
                                </td>
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
export default ApiLog