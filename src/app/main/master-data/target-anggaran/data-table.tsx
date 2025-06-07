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
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReloadIcon } from "@radix-ui/react-icons"
import { deleteTargetAnggaran } from "../../../../../services"
import { ITargetAnggaran, } from "../../../../../services/types"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { numFormatter } from "../../../../../helper"
import { PlusCircle } from "lucide-react"
import { context } from "../../../../../store"
import Form from "./form"
import Paginator from "@/components/tools/paginator"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
  fetchData: ()=>Promise<void>
}

export const penyelenggaraList = [
  {
    value:'1',
    label: 'JNT'
  },
  {
    value:'2',
    label: 'SICEPAT'
  },
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
    const router = useRouter()

    const showAlertDelete = (data:ITargetAnggaran) => {      
      ctx.dispatch({
        alertDialog: {
          type: 'delete',
          title: `Apakah anda yakin ingin menghapus data tahun ${data.tahun} dengan nominal Rp. ${numFormatter(data.nominal)
          }?`,
          onSubmit: async()=>{
            await onDeleteData(data)
          }
        }
      })
    }
    const onDeleteData = async (data:ITargetAnggaran) => {      
      if (data.id)
      await deleteTargetAnggaran(router,data.id)
        .then(()=>{
          toast({
            title: 'Berhasil menghapus data'
          })
          fetchData()
        })
        .catch((err)=>{
          console.log('Err: ',err);
          toast({
            title: err.response.data.message || err.message,
            variant: 'destructive'
          })
        })
    }
    const onClickEditData = (data:ITargetAnggaran)=>{
      ctx.dispatch({
        isModal: {
          title: 'Mengedit Target Anggaran',
          type: "drawer",
          component: <Form trigger={fetchData} data={data}/>
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
    meta: {
      showAlertDelete,
      onClickEditData
    }
  })

  const startItem = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
  const endItem = Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length);

  const onClickAddData = ()=>{
    ctx.dispatch({
      isModal: {
        title: 'Menambah Data Target Anggaran',
        type: "drawer",
        component: <Form trigger={fetchData}/>
      }
    })
  }

  return (
    <div className="rounded-md border md:px-3 px-2">
         <div className="grid grid-cols-1 md:flex items-center py-4 justify-end flex-wrap gap-2">
          <div className="flex justify-start me-auto gap-x-2">
            <Button onClick={onClickAddData}>
              <PlusCircle className="me-1"/> Tambah Data
            </Button>
          </div>
          <Select 
          value={(table.getColumn("tahun")?.getFilterValue() as string) ?? ""}
          onValueChange={(value)=>{
            if (value === 'all') return table.getColumn('tahun')?.setFilterValue('')
            table.getColumn("tahun")?.setFilterValue(value)
          }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={'all'}>Semua Tahun</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2027">2027</SelectItem>
                <SelectItem value="2028">2028</SelectItem>
                
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
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

