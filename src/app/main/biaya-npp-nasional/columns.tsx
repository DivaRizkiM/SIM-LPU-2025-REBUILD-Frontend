"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Lock, LockKeyholeOpen, TableProperties } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, numFormatter } from "../../../../helper"
import { TooltipButton } from "@/components/tools/tooltip"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface BiayaNppNasionalI {
  id: string
  number: number
  bulan: number
  tahun: string
  nominal: string
  status: string
  isLock:boolean
}

export const columns: ColumnDef<BiayaNppNasionalI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "bulan",
    accessorFn: (originalRow) => originalRow.bulan.toString(), // matches is a number
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bulan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => {
      return(
        <div className="text-center">{row.original.bulan}</div>
      )
    }
  },
  {
    accessorKey: "tahun",
    accessorFn: (originalRow) => originalRow.tahun.toString(), // matches is a number
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
    accessorKey: "nominal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nominal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => {
      return(
        <div className="text-center">Rp. {numFormatter(row.original.nominal)}</div>
      )
    }
  },
  {
    id: "actions",
    header: 'Aksi',
    cell: ({ row }) => {
      const data = row.original
      const isLock = data.isLock
 
      return (
        <div className="flex items-center gap-x-1">
          <Link 
            href={`./biaya-npp-nasional/${data.id}`} 
            className={cn(
              buttonVariants({size:'icon',variant:'outline'}),
              isLock && 'pointer-events-none opacity-50'
          )}>
            <TableProperties/>
          </Link>
          {isLock ? (
            <TooltipButton tooltipText={'Akses Edit Terkunci'}>
              <Lock className="w-[10px] h-[10px] text-red-800"/> 
            </TooltipButton>
          ): (
            <TooltipButton tooltipText={'Akses Edit terbuka'}>
              <LockKeyholeOpen className="w-[10px] h-[10px] "/> 
            </TooltipButton>
          )}
        </div>
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
