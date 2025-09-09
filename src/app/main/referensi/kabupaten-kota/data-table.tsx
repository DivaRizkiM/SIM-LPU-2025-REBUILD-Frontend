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
import { PlusCircle, RefreshCcw } from "lucide-react"
import { context } from "../../../../../store"
import { useRouter } from "next/navigation"
import { KabKotaI } from "./columns"
import { deleteKabKota, syncKabKota } from "../../../../../services"
import { toast } from "@/components/ui/use-toast"
import FormData from "./form"
import Paginator from "@/components/tools/paginator"
import { PaginationI } from "@/lib/types"
import { useDebounce } from "../../../../../helper"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination: PaginationI
  fetchData: (page?: number, search?: string)=>Promise<void>
  searchTerm: string
  setSearchTerm: any
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchData,
  pagination,
  searchTerm,
  setSearchTerm
}: DataTableProps<TData, TValue>) {
      const [sorting, setSorting] = useState<SortingState>([])
      const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
          []
      )
      const {
        totalPages,
        startItem,
        endItem,
        total_data,
        currentPage
      } = pagination

      const ctx = context()
      const router = useRouter()
  
      const showAlertDelete = (data:KabKotaI) => {      
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
      const onDeleteData = async (data:KabKotaI) => {      
        await deleteKabKota(router,data.id)
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
  
      const onClickEditData = (data:KabKotaI)=>{
        ctx.dispatch({
          isModal: {
            title: 'Mengubah Data Kabupaten/Kota',
            type: "drawer",
            component: <FormData trigger={fetchData} data={data}/>
          }
        })
      }
  
      const onSyncClick = ()=> {
        ctx.dispatch({
          alertDialog: {
            type: 'sync',
            title: `Apakah anda yakin ingin menyinkronkan Kabupaten/Kota?`,
            onSubmit: async()=>{
              await syncKabKota(router)
                .then((res)=>{
                  toast({
                    title: 'Sinkronisasi Sukses!'
                  })
                  fetchData()
                })
                .catch((err)=>{
                  console.log('Err: ',err);
                  toast({
                    title: 'Sinkronisasi Gagal',
                    variant: "destructive"
                  })
                })
            }
          }
        })
      }
  
      const onClickTambahData = ()=>{
        ctx.dispatch({
          isModal: {
            title: 'Tambah Data Kabupaten/Kota',
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


  return (
    <div className="rounded-md border md:px-3 px-2">
         <div className="flex items-center py-4 justify-between flex-wrap gap-2">
            <div className="flex gap-1">
              <Button onClick={onClickTambahData}><PlusCircle className="me-1"/> Tambah Data</Button>
              <Button onClick={onSyncClick}><RefreshCcw className="me-1"/> Sinkronisasi</Button>
            </div>
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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(pageNumber) => {
              fetchData(pageNumber,searchTerm)
            }}
            showPreviousNext
            // isLoading={isLoading}
          />
          <div className="pagination-summary text-[9px] lg:text-xs items-center w-full lg:w-auto mt-2 md:mt-0 text-center">
            Menampilkan <span className="font-bold">{startItem}-{endItem}</span> dari <span className="font-bold">{total_data}</span> item.
          </div>
        </div>
    </div>
  )
}
