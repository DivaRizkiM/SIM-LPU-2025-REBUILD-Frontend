"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, TableProperties } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface VerifikasiKprkI {
  id_verifikasi_biaya_rutin: string
  number: number
  triwulan: number
  tahun: string
  nama_regional: string
  id_kcu:string
  nama_kcu:string
  total_biaya: string
  status: string
  id_kpc: string
  nama_kpc: string
}

export const columns: ColumnDef<VerifikasiKprkI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "triwulan",
    header: "Triwulan",
  },
  {
    accessorKey: "tahun",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tahun
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
    accessorKey: "nama_kcu",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          KCU
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "nama_kpc",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          KPC
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
    },
  },
  {
    id: "actions",
    header: 'Aksi',
    cell: ({ row }) => {
      const data = row.original
 
      return (
       <Link 
        href={`./pelaporan-verifikasi?br_id=${data.id_verifikasi_biaya_rutin}&kcu_id=${data.id_kcu}&kcp_id=${data.id_kpc}&triwulan=${data.triwulan}&tahun=${data.tahun}`} 
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
