"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { ReloadIcon } from "@radix-ui/react-icons"
import Combobox from "@/components/tools/combobox"
import { FormCustomOption } from "../../../../store/state"
import { deleteKpc, getKPRKByRegional, getRegional } from "../../../../services"
import { useRouter } from "next/navigation"
import { RegionalI } from "../referensi/regional/columns"
import { cn } from "@/lib/utils"
import { kcuI } from "../referensi/kc-kcu/columns"
import { context } from "../../../../store"
import { ProfilKcpI } from "./columns"
import { toast } from "@/components/ui/use-toast"
import Paginator from "@/components/tools/paginator"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
  fetchData: ()=>void
}

const tahun = [
  {
    value:'2024',
    label: '2024'
  },
  {
    value:'2023',
    label: '2023'
  },
  {
    value:'2022',
    label: '2022'
  },
  {
    value:'2021',
    label: '2021'
  },
  {
    value:'2020',
    label: '2020'
  }
]

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  fetchData
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
      []
    )
    const ctx = context()
    const onClickDelete = (data: ProfilKcpI)=> {
      ctx.dispatch({
        alertDialog: {
          type: 'delete',
          title: `Apakah anda yakin ingin menghapus ${data.nama}?`,
          onSubmit: async()=> {
            try {
              await deleteKpc(router,data.id.toString()) 
              toast({
                title: `Berhasil delete ${data.nama}`
              })
              return await fetchData()
            } catch (error) {
              toast({
                title: `Gagal delete ${data.nama}`,
                variant: 'destructive'
              })
            }
          },
        }
      })
    }
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      columnVisibility: {
        id_regional: false,
        id_kprk: false
      }
    },
    meta: {
      onClickDelete
    }
  })
  const topRef = useRef<HTMLDivElement>(null);
  const router = useRouter()
  const [regionalOptions, setRegionalOptions] = useState<Array<FormCustomOption>>([])
  const [isRegionalLoading,setIsRegionalLoading] = useState<boolean>(false)
  const [kprkOptions, setKprkOptions] = useState<Array<FormCustomOption>>([])
  const [isKprkLoading,setIsKprkLoading] = useState<boolean>(false)

  const firstInit = async()=> {
    setIsRegionalLoading(true)
    await getRegional(router,'?limit=99')
      .then((response)=>{
          let regionals:Array<any> = response.data.data.map((item:RegionalI) => ({
              value: item.id.toString(),
              label: item.nama,
          }));
          regionals.unshift({
            value: 'all',
            label: 'Semua regional'
          })
          setRegionalOptions(regionals)
      })
      .catch((err)=>{
          console.log('Err: ',err);
      })
      .finally(()=>{
          setIsRegionalLoading(false)
      })
}
useEffect(()=>{
    firstInit()
    /* eslint-disable react-hooks/exhaustive-deps */
},[])

const getKprk = async(id_regional: string|number)=> {
  setIsKprkLoading(true)
  await getKPRKByRegional(router,id_regional)
    .then((response)=>{
      const kprks = response.data.data.map((item:kcuI) => ({
          value: item.id.toString(),
          label: item.nama,
      }));
      kprks.unshift({
        value: 'all',
        label: 'Semua KPRK'
      })
      setKprkOptions(kprks)
    })
    .catch((err)=>{
      console.log('Err: ',err);
    })
    .finally(()=>{
      setTimeout(()=>{
        setIsKprkLoading(false)
      },500)
    })
}

  // Fungsi untuk menangani klik tombol "Next" atau "Prev"
  // const handleNextClick = () => {
  //     // Lakukan scroll ke paling atas
  //     topRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
  // };
   // Calculate the item range being displayed
   const startItem = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
   const endItem = Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length);

  return (
    <div className="rounded-t-md border" ref={topRef}>
        <div className="grid grid-cols-1 md:flex items-center py-4 justify-end flex-wrap gap-2 md:px-3 px-2">
          <div className="md:w-[260px]">
            <Combobox 
              value={(table.getColumn("id_regional")?.getFilterValue() as string) ?? ""}
              options={regionalOptions} 
              placeholder={"Regional"} 
              onSelect={(value:string)=> {
                table.getColumn("id_kprk")?.setFilterValue('')
                setKprkOptions([])
                if (value === 'all'){
                  return table.getColumn('id_regional')?.setFilterValue('')
                } 
                table.getColumn("id_regional")?.setFilterValue(value)
                return getKprk(value)
              }}
            />
          </div>
          <div className="md:w-[260px]">
            <Combobox 
              value={(table.getColumn("id_kprk")?.getFilterValue() as string) ?? ""}
              options={kprkOptions} 
              placeholder={"KC-KCU"} 
              onSelect={(value:string)=> {
                if (value === 'all') return table.getColumn('id_kprk')?.setFilterValue('')
                table.getColumn("id_kprk")?.setFilterValue(value)
              }}
              isLoading={isKprkLoading}
              disabled={kprkOptions.length <= 0 || isKprkLoading || !table.getColumn("id_regional")?.getFilterValue()}
            />
          </div>
          <Input
            placeholder="Cari berdasarkan nama kantor pos"
            value={(table.getColumn("nama")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("nama")?.setFilterValue(event.target.value)
            }
            className="w-full md:w-1/3"
          />
        </div>
        <div className="md:px-3 px-2">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div key={row.id} className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 border dark:bg-gray-900 mb-4 p-4 gap-y-2 shadow-lg rounded dark:hover:bg-gray-900/50 hover:bg-slate-200/50"> 
                <div className="absolute -left-2 -top-2 text-xs text-black bg-white rounded-lg p-3 w-7 h-7 justify-center flex items-center font-bold border">
                  {(table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1}
                </div>
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className={cn(
                    'border-e-2 px-3 space-y-2 flex flex-col justify-center',
                    cell.id.includes('actions') && 'col-end-3 sm:col-auto md:col-end-6 border-0'
                  )}>
                    <h6 className="text-[13px] font-bold">
                      {flexRender(cell.column.columnDef.header, table.getHeaderGroups()[0].headers[0].getContext())}
                    </h6>
                    <div className="text-[11px] break-words">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                ))}
              </div>
            )
          )
          ): (
            <div className="mx-auto w-full h-20 flex items-center">
              {isLoading ? (
                    <div className="mx-auto flex justify-center items-center">
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Loading… 
                    </div>
                  ): (
                    <span className="block text-center w-full">No results.</span>
                  )}
            </div>
          )}
        </div>
        <div className="flex lg:flex-row flex-col items-center lg:justify-between py-2 px-2 lg:px-4 rounded-t-md overflow-x-scroll pb-5 mt-2 lg:pb-2">
          <Paginator
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(pageNumber) => table.setPageIndex(pageNumber - 1)}
            showPreviousNext
            isLoading={isLoading}
          />
        <div className="pagination-summary text-[9px] lg:text-xs items-center w-full lg:w-auto mt-2 md:mt-0 text-center">
          Menampilkan <span className="font-bold">{startItem}-{endItem}</span> dari <span className="font-bold">{data.length}</span> item.
        </div>
      </div>
    </div>
  )
}
