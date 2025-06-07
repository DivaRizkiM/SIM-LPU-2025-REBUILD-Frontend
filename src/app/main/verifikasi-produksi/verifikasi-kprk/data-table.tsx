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
import { buttonVariants } from "@/components/ui/button"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "next/navigation"
import { ArrowLeftCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ReloadIcon } from "@radix-ui/react-icons"
import Paginator from "@/components/tools/paginator"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
}
const status = [
  {
    value:'belum verifikasi',
    label: 'Belum verifikasi'
  },
  {
    value:'sudah verifikasi',
    label: 'Sudah verifikasi'
  },
]

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
      )
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
  })
  const searchParams = useSearchParams()
  const tahun = searchParams.get('tahun')
  const triwulan = searchParams.get('triwulan')

  const startItem = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
  const endItem = Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length);

  return (
    <div className="rounded-md border md:px-3 px-2">
         <div className="flex items-center py-4 justify-end flex-wrap gap-2">
          <Link href={`./`} className={cn(
            buttonVariants({variant: 'ghost'}),
            'me-auto'
          )}> 
            <ArrowLeftCircle className="me-2"/>
            Kembali
          </Link>
          <Input value={`${tahun}`} readOnly className="w-full md:w-min bg-secondary"/>
          <Input value={`triwulan ${triwulan}`} readOnly className="w-full md:w-min bg-secondary"/>
          <Select 
          value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
          onValueChange={(value)=>{
            if (value === 'all') return table.getColumn('status')?.setFilterValue('')
            table.getColumn("status")?.setFilterValue(value)
          }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={'all'}>Semua status</SelectItem>
                {status.map((t,index)=>(
                  <SelectItem value={t.value} key={index}>{t.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
            <Input
              placeholder="Nama KCU"
              value={(table.getColumn("nama_kcu")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                  table.getColumn("nama_kcu")?.setFilterValue(event.target.value)
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
