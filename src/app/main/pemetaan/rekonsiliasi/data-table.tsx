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
  Row
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
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReloadIcon } from "@radix-ui/react-icons"
import { deleteRekonsiliasi, getKabKota, getProvinsi } from "../../../../../services"
import { IRekonsiliasi, KabKotaI, ProvinsiI } from "../../../../../services/types"
import { useRouter } from "next/navigation"
import { FormCustomOption } from "../../../../../store/state"
import { toast } from "@/components/ui/use-toast"
import { stringifyError } from "../../../../../helper"
import { PlusCircle, UploadCloud } from "lucide-react"
import { context } from "../../../../../store"
import Form from "./form"
import ImportRekonsiliasiComponent from "./form/import"
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
  const [isProvinsiLoading, setIsProvinsiLoading] = useState<boolean>(false)
  const [provinsiOptions, setProvinsiOptions] = useState<Array<FormCustomOption>>
  ([])
  const [kabKotaOptions, setKabKotaOptions] = useState<Array<FormCustomOption>>([])
  const [isKotaLoading,setIsKotaLoading] = useState<boolean>(false)

  const firstInit = async()=> {
    setIsProvinsiLoading(true)
    await getProvinsi(router,'?limit=99')
    .then((res)=>{      
        const provinces = res.data.data.map((item:ProvinsiI) => ({
            value: item.id.toString(),
            label: item.nama,
        }));
        setProvinsiOptions(provinces)
    })
    .catch((err)=>{
        console.log('Err: ',err);
    })
    .finally(()=>{
      setIsProvinsiLoading(false)
    })
  }
  useEffect(()=>{
    firstInit()
    /* eslint-disable react-hooks/exhaustive-deps */
  },[])

  const getKabKotaByProvinsi = async(id:number|string)=>{
    setIsKotaLoading(true)
    try {
      const res = await getKabKota(router,`?id_provinsi=${id}`)
      const kabKotas = res.data.data.map((item:KabKotaI) => ({
        value: item.id.toString(),
        label: item.nama,
      }))
      setKabKotaOptions(kabKotas)
    } catch (error:any) {
      toast({
        title: error.response?.data 
            ? stringifyError(error.response?.data.message)
            : error.message,
        variant: 'destructive'
    })
    } finally {
      setTimeout(()=>{
        setIsKotaLoading(false)
      },500)
    }
  }


  const onClickAddData = ()=>{
    ctx.dispatch({
      isModal: {
        title: 'Menambah Data Rekonsiliasi',
        type: "modal",
        component: <Form trigger={fetchData}/>
      }
    })
  }
  const onClickEditData = (data:IRekonsiliasi)=>{
    ctx.dispatch({
      isModal: {
        title: 'Mengubah Data Rekonsiliasi',
        type: "modal",
        component: <Form trigger={fetchData} data={data}/>
      }
    })
  }
  const onClickImportData = ()=>{
    ctx.dispatch({
      isModal: {
        title: 'Import Data Rekonsiliasi',
        type: "drawer",
        component: <ImportRekonsiliasiComponent/>
      }
    })
  }

  const showAlertDelete = (data:IRekonsiliasi) => {      
    ctx.dispatch({
      alertDialog: {
        type: 'delete',
        title: `Apakah anda yakin ingin menghapus?`,
        onSubmit: async()=>{
          await onDeleteData(data)
        }
      }
    })
  }
  const onDeleteData = async (data:IRekonsiliasi) => {      
    await deleteRekonsiliasi(router,data.id)
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

  const globalFilterFn =(
    row: Row<any>,
    columnId: string,
    filterValue: string
  ): boolean => {
    const namaKantor = row.getValue('nama_kantor') as string;
    const namaProvinsi = row.original.nama_provinsi as string;
    const kabupaten_kota = row.original.nama_kabupaten as string;
    const namaKecamatan = row.getValue('nama_kecamatan') as string;
  
    const searchText = filterValue.toLowerCase();

    return (
      namaKantor?.toLowerCase().includes(searchText) ||
      namaProvinsi?.toLowerCase().includes(searchText) ||
      namaKecamatan?.toLowerCase().includes(searchText) || 
      kabupaten_kota?.toLowerCase().includes(searchText)
    );
  };


  const table = useReactTable({
    data,
    columns,
    globalFilterFn: globalFilterFn,
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
      onClickEditData,
      showAlertDelete
    }
  })

  const startItem = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1;
  const endItem = Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, data.length);

  return (
    <div className="rounded-md border md:px-3 px-2">
         <div className="grid grid-cols-1 md:flex items-center py-4 justify-end flex-wrap gap-2">
          <div className="flex justify-start me-auto gap-x-2">
            <Button onClick={onClickAddData}>
              <PlusCircle className="me-1"/> Tambah Data
            </Button>
            <Button onClick={onClickImportData}>
              <UploadCloud className="me-1"/> Import
            </Button>
          </div>
          <Select 
          value={(table.getColumn("nama_penyelenggara")?.getFilterValue() as string) ?? ""}
          onValueChange={(value)=>{
            if (value === 'all') return table.getColumn('nama_penyelenggara')?.setFilterValue('')
            table.getColumn("nama_penyelenggara")?.setFilterValue(value)
          }}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Penyelenggara" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={'all'}>Semua Penyelenggara</SelectItem>
                {penyelenggaraList.map((data,key)=>(
                  <SelectItem value={data.value} key={key}>{data.label}</SelectItem>
                ))}
                
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select 
          value={(table.getColumn("id_provinsi")?.getFilterValue() as string) ?? ""}
          onValueChange={(value)=>{
            if (value === 'all') {
              table.getColumn('id_provinsi')?.setFilterValue('')
              setKabKotaOptions([])
              return table.getColumn('id_kabupaten_kota')?.setFilterValue('')
            }
            getKabKotaByProvinsi(value)
            table.getColumn("id_provinsi")?.setFilterValue(value)
            table.getColumn("kabupaten_kota")?.setFilterValue('')
          }}
          disabled={isProvinsiLoading}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={isProvinsiLoading ? 'Loading..' : 'Provinsi'} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={'all'}>
                  Semua Provinsi
                </SelectItem>
                {provinsiOptions.map((prov,index)=>(
                  <SelectItem value={`${prov.value}`} key={index}>{prov.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select 
          value={(table.getColumn("id_kabupaten_kota")?.getFilterValue() as string) ?? ""}
          onValueChange={(value)=>{
            if (value === 'all') return table.getColumn('id_kabupaten_kota')?.setFilterValue('')
            table.getColumn("id_kabupaten_kota")?.setFilterValue(value)
          }}
          disabled={isKotaLoading}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder={isKotaLoading ? 'Loading..' : 'Kabupaten/Kota'}/>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={'all'}>Semua Kabupaten/Kota</SelectItem>
                {kabKotaOptions.map((data,index)=>(
                  <SelectItem value={`${data.value}`} key={index}>{data.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
            <Input
              placeholder="Search..."
              value={table.getState().globalFilter || ''}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              className="w-full md:w-[180px]"
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

