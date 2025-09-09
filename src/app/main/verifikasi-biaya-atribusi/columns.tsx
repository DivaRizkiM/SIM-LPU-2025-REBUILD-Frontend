"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, TableProperties } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface VerifikasiAtribusiI {
  id: string
  number: number
  triwulan: number
  tahun_anggaran: string
  nama_regional: string
  id_regional: number,
  total_biaya: string
  status: string
}

export const columns: ColumnDef<VerifikasiAtribusiI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "triwulan",
    accessorFn: (originalRow) => originalRow.triwulan.toString(), // matches is a number
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Triwulan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => {
      return(
        <div className="text-center">{row.original.triwulan}</div>
      )
    }
  },
  {
    accessorKey: "tahun_anggaran",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tahun Anggaran
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "nama_regional",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Regional
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "total_biaya",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Biaya
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    id: "actions",
    header: 'Aksi',
    cell: ({ row }) => {
      const data = row.original
 
      return (
       <Link 
        href={`verifikasi-biaya-atribusi/verifikasi-kprk?regID=${data.id_regional}&tahun=${data.tahun_anggaran}&triwulan=${data.triwulan}`} 
        className={cn(
          buttonVariants({size:'icon',variant:'outline'})
       )}>
        <TableProperties/>
       </Link>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const data = row.original

      const getStatusColor = () => {
        switch (data.status) {
          case 'Sudah Verifikasi':
            return 'success'
          default:
            return 'secondary'
        }
      }
      return (
        <Badge variant={getStatusColor()}>{data.status}</Badge>
      )
    },
  },
]
