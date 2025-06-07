"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { IRekonsiliasi } from "../../../../../services/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


export const columns: ColumnDef<IRekonsiliasi>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "nama_penyelenggara",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Penyelenggara
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "nama_kantor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Kantor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "id_kantor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID Kantor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "id_jenis_kantor",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jenis Kantor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "id_provinsi",
    accessorFn: (originalRow) => originalRow?.id_provinsi? originalRow?.id_provinsi.toString() : '',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Provinsi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => row.original.nama_provinsi,
    filterFn: (row, columnId, filterValue) => {
      // Check if it's a select filter or search filter
      const namaProvinsi = row.original.nama_provinsi; // For search filter
      const idProvinsi = row.getValue(columnId); // For select filter (id)
      
      // If filterValue is a number (for select by id_provinsi), filter by ID
      if (!isNaN(Number(filterValue))) {
        return idProvinsi === filterValue;
      }
  
      // Otherwise, use search filter on nama_provinsi
      if (typeof namaProvinsi === 'string' && typeof filterValue === 'string') {
        return namaProvinsi.toLowerCase().includes(filterValue.toLowerCase());
      }
  
      return false;
    },
  },
  {
    accessorKey: "id_kabupaten_kota",
    accessorFn: (originalRow) => originalRow?.id_kabupaten_kota? originalRow?.id_kabupaten_kota.toString() : '',
    cell: ({ row }) => row.original.nama_kabupaten,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kabupaten/Kota
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "nama_kecamatan",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kecamatan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row,table }) => {
      const data = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={()=>{
              (table.options.meta as any).onClickEditData(data)
            }} >
              Edit Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={()=>{
              (table.options.meta as any).showAlertDelete(data)
            }}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
]
