"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, DownloadIcon, FilePenIcon, Lock, LockKeyholeOpen, TableProperties } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, numFormatter } from "../../../../helper"
import { TooltipButton } from "@/components/tools/tooltip"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface BiayaLtkI {
  id: string
  kode_rekening: number
  nama_rekening: number
  mtd_akuntansi: string
  verifikasi_akuntansi: string
  biaya_pso: string
  verifikasi_pso: string
  mtd_ltk_pelaporan: string
  mtd_ltk_verifikasi: string
  proporsi_rumus: string
  verifikasi_proporsi: string
  isLock: boolean
  status: string
}

export const columns: ColumnDef<BiayaLtkI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "kode_rekening",
    accessorFn: (originalRow) => originalRow.kode_rekening.toString(), // matches is a number
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kode rekening
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.original.kode_rekening}</div>
      )
    }
  },
  {
    accessorKey: "nama_rekening",
    accessorFn: (originalRow) => originalRow.nama_rekening.toString(), // matches is a number
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Rekening
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "mtd_akuntansi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          MTD Akuntansi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">Rp. {numFormatter(row.original.mtd_akuntansi)}</div>
      )
    }
  },
  {
    accessorKey: "verifikasi_akuntansi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Verifikasi Akuntansi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">Rp. {numFormatter(row.original.verifikasi_akuntansi)}</div>
      )
    }
  },
  {
    accessorKey: "biaya_pso",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Biaya PSO
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">Rp. {numFormatter(row.original.biaya_pso)}</div>
      )
    }
  },
  {
    accessorKey: "verifikasi_pso",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Verifikasi PSO
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">Rp. {numFormatter(row.original.verifikasi_pso)}</div>
      )
    }
  },
  {
    accessorKey: "mtd_ltk_pelaporan",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          MTD LTK Pelaporan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">Rp. {numFormatter(row.original.mtd_ltk_pelaporan)}</div>
      )
    }
  },
  {
    accessorKey: "mtd_ltk_verifikasi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          MTD LTK Verifikasi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">Rp. {numFormatter(row.original.mtd_ltk_verifikasi)}</div>
      )
    }
  },
  {
    accessorKey: "proporsi_rumus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Proporsi Detail Rumus
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{numFormatter(row.original.proporsi_rumus)}</div>
      )
    }
  },
  {
    accessorKey: "verifikasi_proporsi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Verifikasi Proporsi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{numFormatter(row.original.verifikasi_proporsi)}</div>
      )
    }
  },

  {
    id: "actions",
    header: "Aksi",
    cell: ({ row, table }) => {
      const data = row.original;
      const meta = table.options.meta as any;
      const isLock = data.isLock;

      return (
        <div className="flex items-center justify-center gap-x-1">
          <Link
            href={`./biaya-ltk/${data.id}`}
            className={`flex items-center text-blue-600 hover:underline text-sm ${isLock ? "pointer-events-none opacity-50" : ""
              }`}
          >
            <FilePenIcon className="w-4 h-4 me-1" />
 
          </Link>

          <span className="flex items-center text-red-700 text-xs">
            <DownloadIcon className="w-4 h-4 me-1" />
          </span>
          {isLock ? (
            <TooltipButton tooltipText={"Akses Edit Terkunci"}>
              <Lock className="w-[10px] h-[10px] text-red-800" />
            </TooltipButton>
          ) : (
            <TooltipButton tooltipText={"Akses Edit terbuka"}>
              <LockKeyholeOpen className="w-[10px] h-[10px] " />
            </TooltipButton>
          )}
        </div>
      );
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
