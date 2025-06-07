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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button, buttonVariants } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { getDetailKPRK, getKPRK } from "../../../../../services"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowLeftCircle } from "lucide-react"
import { ReloadIcon } from "@radix-ui/react-icons"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
}


export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
      )
      const searchParams = useSearchParams()
      const triwulan = searchParams.get('triwulan')
      const tahun = searchParams.get('tahun')
      const kcu_id = searchParams.get('kcu_id')
      const ba_id = searchParams.get('ba_id')

    const getMonth = (no_urut:number)=> {      
      switch (no_urut) {
        case 1:
          switch (triwulan) {
            case '1':
              return 'Januari'
            case '2':
              return 'April'
            case '3':
              return 'Juli'
            case '4':
              return 'Oktober'
            default:
              break;
          }
        case 2:
          switch (triwulan) {
            case '1':
              return 'Februari'
            case '2':
              return 'Mei'
            case '3':
              return 'Agustus'
            case '4':
              return 'November'
            default:
              break;
          }
        case 3:
          switch (triwulan) {
            case '1':
              return 'Maret'
            case '2':
              return 'Juni'
            case '3':
              return 'September'
            case '4':
              return 'Desember'
            default:
              break;
          }
      }
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
    meta: {
      getMonth,
      ba_id,
      kcu_id,
      tahun
    }
  })
  const router = useRouter()
  const [nama_kcu,setNama_kcu] = useState<string>('')
  const [id_regional,setId_regional] = useState<number>()
  const getKcu = async()=> {
    if (!kcu_id) return
    await getDetailKPRK(router,parseInt(kcu_id))
      .then((res)=> {
        setNama_kcu(res.data.data.nama)
        setId_regional(res.data.data.id_regional)
      })
      .catch((err)=> {
        console.log('Err: ',err);
      })
  }
  useEffect(()=>{
    getKcu()
    /* eslint-disable react-hooks/exhaustive-deps */
  },[])


  return (
    <div className="rounded-md border md:px-3 p-2">
      <div className="flex items-center py-4 justify-end flex-wrap gap-2">
          <Link 
            href={`./verifikasi-kprk?regID=${id_regional}&tahun=${tahun}&triwulan=${triwulan}`} 
            className={cn(
              buttonVariants({variant: 'ghost'}),
                'me-auto'
            )}>
              <ArrowLeftCircle className="me-2"/>
              Kembali
          </Link>
          <Input value={nama_kcu} readOnly className="w-full md:w-min bg-secondary"/>
          <Input value={`${tahun}`} readOnly className="w-full md:w-min bg-secondary"/>
          <Input value={`triwulan ${triwulan}`} readOnly className="w-full md:w-min bg-secondary"/>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header,key) => {
                return (
                  <TableHead key={key} colSpan={header.colSpan}  className="border">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row,key) => (
              <TableRow
                key={key}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell,key) => (
                  <TableCell key={key} className="border text-[13px]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={12} className="h-24 text-center">
                {isLoading ? (
                  <div className="mx-auto flex justify-center items-center">
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Loading… 
                </div>
                ): 'No results.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-start space-x-2 py-4 px-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
