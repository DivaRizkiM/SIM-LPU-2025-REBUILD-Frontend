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
import { Input } from "@/components/ui/input"
import { PlusCircle } from "lucide-react"
import FormData from "./form"
import { context } from "../../../../../store"
import { useRouter } from "next/navigation"
import { JenisKantorI } from "./columns"
import { deleteJenisKantor } from "../../../../../services"
import { toast } from "@/components/ui/use-toast"
import Paginator from "@/components/tools/paginator"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  fetchData: ()=>void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchData
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
      )
      const ctx = context()
      const router = useRouter()
  
      const showAlertDelete = (data:JenisKantorI) => {      
        ctx.dispatch({
          alertDialog: {
            type: 'delete',
            title: `Apakah anda yakin ingin menghapus ${data.nama}?`,
            onSubmit: async()=>{
              await onDeleteData(data)
            }
          }
        })
      }
      const onDeleteData = async (data:JenisKantorI) => {      
        await deleteJenisKantor(router,data.id)
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
  
      const onClickEditData = (data:JenisKantorI)=>{
        ctx.dispatch({
          isModal: {
            title: 'Mengubah Data Jenis Kantor',
            type: "drawer",
            component: <FormData trigger={fetchData} data={data}/>
          }
        })
      }
  
      const onClickTambahData = ()=>{
        ctx.dispatch({
          isModal: {
            title: 'Tambah Data Jenis Kantor',
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
          showAlertDelete,
          onClickEditData
        }
      })  

      const startItem = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
      const endItem = Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length);


  return (
    <div className="rounded-md border md:px-3 px-2">
         <div className="flex items-center py-4 justify-between flex-wrap gap-2">
            <div className="flex gap-1">
              <Button onClick={onClickTambahData}><PlusCircle className="me-1"/> Tambah Data</Button>
            </div>
            <Input
              placeholder="Search"
              value={(table.getColumn("nama")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                  table.getColumn("nama")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
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
                No results.
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
            // isLoading={isLoading}
          />
          <div className="pagination-summary text-[9px] lg:text-xs items-center w-full lg:w-auto mt-2 md:mt-0 text-center">
            Menampilkan <span className="font-bold">{startItem}-{endItem}</span> dari <span className="font-bold">{data.length}</span> item.
          </div>
        </div>
    </div>
  )
}
