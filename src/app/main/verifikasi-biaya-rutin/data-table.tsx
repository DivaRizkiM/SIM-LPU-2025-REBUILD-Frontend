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
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReloadIcon } from "@radix-ui/react-icons"
import Paginator from "@/components/tools/paginator"
import { useDebounce } from "../../../../helper"
import statusVerifikasi from '@/lib/statusVerifikasi.json'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading: boolean
  fetchData: (tahun: string, triwulan: string, status: '7' | '9' | string, search: string) => Promise<void>
}

const tahun = [
  {
    value: '2025',
    label: '2025'
  },
  {
    value: '2024',
    label: '2024'
  },
  {
    value: '2023',
    label: '2023'
  },
  {
    value: '2022',
    label: '2022'
  },
  {
    value: '2021',
    label: '2021'
  },
  {
    value: '2020',
    label: '2020'
  }
]
const triwulan = [
  {
    value: '4',
    label: 'IV'
  },
  {
    value: '3',
    label: 'III'
  },
  {
    value: '2',
    label: 'II'
  },
  {
    value: '1',
    label: 'I'
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

  const startItem = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
  const endItem = Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length);

  const [tahunSelected, setTahunSelected] = useState<string>('')
  const [triwulanSelected, setTriwulanSelected] = useState<string>('')
  const [statusSelected, setStatusSelected] = useState<string>('')
  const [search, setSearch] = useState<string>('')

  const handleSearchDebounced = useDebounce(
    // Fungsi pencarian yang akan dipanggil dengan debounce
    (searchVal) => {
      fetchData(tahunSelected, triwulanSelected, statusSelected, searchVal)
    },
    // Nilai-nilai yang ingin dijadikan argumen untuk fungsi pencarian
    [search],
    // Waktu penundaan sebelum menjalankan fungsi pencarian (dalam milidetik)
    500 // Misalnya, setelah pengguna selesai mengetik selama 500ms, pencarian akan dipicu
  );

  return (
    <div className="rounded-md border md:px-3 px-2 mb-8">
      <div className="grid grid-cols-1 md:flex items-center py-4 justify-end flex-wrap gap-2">
        <Select
          value={tahunSelected}
          onValueChange={(value) => {
            setTahunSelected(value)
            fetchData(value, triwulanSelected, statusSelected, search)
          }}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={'all'}>Semua Tahun</SelectItem>
              {tahun.map((t, index) => (
                <SelectItem value={t.value} key={index}>{t.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={triwulanSelected}
          onValueChange={(value) => {
            setTriwulanSelected(value)
            fetchData(tahunSelected, value, statusSelected, search)
          }}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Triwulan" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={'all'}>Semua Triwulan</SelectItem>
              {triwulan.map((t, index) => (
                <SelectItem value={t.value} key={index}>{t.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={statusSelected}
          onValueChange={(value) => {
            setStatusSelected(value)
            fetchData(tahunSelected, triwulanSelected, value, search)
          }}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={'all'}>Semua status</SelectItem>
              {statusVerifikasi.map((t, index) => (
                <SelectItem value={t.value} key={index}>{t.label}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          placeholder="Cari"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            handleSearchDebounced
          }}
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
                ) : 'No results.'}
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
