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
import FormData from "./form"
import { context } from "../../../../../store"
import { useRouter } from "next/navigation"
import { KelurahanI } from "./columns"
import { deleteKelurahan, syncKelurahan } from "../../../../../services"
import { toast } from "@/components/ui/use-toast"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useDebounce } from "../../../../../helper"
import { PaginationI } from "@/lib/types"
import Paginator from "@/components/tools/paginator"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  fetchData: (page?: number, search?: string)=>Promise<void>
  isLoading: boolean
  searchTerm: string
  setSearchTerm: any
  pagination: PaginationI
}

export function DataTable<TData, TValue>({
  columns,
  data,
  fetchData,
  isLoading,
  searchTerm,
  setSearchTerm,
  pagination
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
        []
    )
    const ctx = context()
    const router = useRouter()

    const {
      totalPages,
      startItem,
      endItem,
      total_data,
      currentPage
    } = pagination
  
      const showAlertDelete = (data:KelurahanI) => {      
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
      const onDeleteData = async (data:KelurahanI) => {      
        await deleteKelurahan(router,data.id)
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
  
      const onClickEditData = (data:KelurahanI)=>{
        ctx.dispatch({
          isModal: {
            title: 'Mengubah Data Kelurahan',
            type: "drawer",
            component: <FormData trigger={fetchData} data={data}/>
          }
        })
      }
  
      const onSyncClick = ()=> {
        ctx.dispatch({
          alertDialog: {
            type: 'sync',
            title: `Apakah anda yakin ingin menyinkronkan Kelurahan?`,
            onSubmit: async()=>{
              await syncKelurahan(router)
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
            title: 'Tambah Data Kelurahan',
            type: "drawer",
            component: <FormData trigger={fetchData}/>
          }
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

  return (
    <div className="rounded-md border md:px-3 px-2">
         <div className="flex items-center py-4 justify-between flex-wrap gap-2">
            <div className="flex gap-1">
              <Button onClick={onClickTambahData}><PlusCircle className="me-1"/> Tambah Data</Button>
              <Button onClick={onSyncClick}><RefreshCcw className="me-1"/> Sinkronisasi</Button>
            </div>
            <Input
              placeholder="Filter berdasarkan nama kelurahan"
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
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className='h-24'
              >
                <div className="mx-auto flex justify-center items-center">
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Loading… 
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row,key) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {cell.column.id === "number" && startItem + key }
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
          onPageChange={(pageNumber) =>fetchData(pageNumber,searchTerm)}
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
