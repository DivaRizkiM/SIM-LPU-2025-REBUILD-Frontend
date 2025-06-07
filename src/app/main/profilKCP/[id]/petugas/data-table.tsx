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
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReloadIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowLeftCircle, PlusIcon } from "lucide-react"
import { PetugasKPC } from "./columns"
import FormData from "./form"
import { context } from "../../../../../../store"
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
const bulan = [
  {
    value:'1',
    label: '1'
  },
  {
    value:'2',
    label: '2'
  },
  {
    value:'3',
    label: '3'
  },
  {
    value:'4',
    label: '4'
  },
  {
    value:'5',
    label: '5'
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

    const onClickEditData = (data: PetugasKPC)=>{
      ctx.dispatch({
        isModal: {
          title: 'Mengubah Data Petugas KPC',
          type: "drawer",
          component: <FormData trigger={fetchData} data={data}/>
        }
      })
    }
    const onClickTambahData = ()=>{
      ctx.dispatch({
        isModal: {
          title: 'Tambah Data Petugas KPC',
          type: "drawer",
          component: <FormData trigger={fetchData}/>
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
      onClickEditData
    }

  })


  return (
    <div className="rounded-md border md:px-3 px-2">
         <div className="grid grid-cols-1 md:flex items-center py-4 justify-end flex-wrap gap-2">
         <Link href={`../`} className={cn(
            buttonVariants({variant: 'ghost'}),
            'me-auto'
          )}> 
            <ArrowLeftCircle className="me-2"/>
            Kembali
          </Link>
          <Button onClick={onClickTambahData}>
            <PlusIcon className="w-4 h-4 me-2"/>
            Tambah Data
          </Button>
          <Input
            placeholder="Cari berdasarkan nama petugas"
            value={(table.getColumn("nama_petugas")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("nama_petugas")?.setFilterValue(event.target.value)
            }
            className="w-full md:w-1/3"
          />
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
