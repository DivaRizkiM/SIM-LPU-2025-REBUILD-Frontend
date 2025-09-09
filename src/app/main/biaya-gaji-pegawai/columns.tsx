"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, DownloadIcon, FilePenIcon, Lock, LockKeyholeOpen, TableProperties } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, numFormatter } from "../../../../helper"
import { TooltipButton } from "@/components/tools/tooltip"
import { BiayaGajiPegawaiI } from '../../../../services/types'
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<BiayaGajiPegawaiI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "nama_pegawai",
    accessorFn: (originalRow) => originalRow.nama_pegawai.toString(),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className='text-center'
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Pegawai
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.original.nama_pegawai}</div>
      )
    }
  },
  {
    accessorKey: "jabatan",
    accessorFn: (originalRow) => originalRow.jabatan.toString(),
    header: ({ column }) => {
      return (
        <Button
          className='text-center'
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jabatan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "nama_bagian",
    header: ({ column }) => {
      return (
        <Button
          className='text-center'
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Bagian
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.original.nama_bagian}</div>
      )
    }
  },
  {
    accessorKey: "Kantor",
    header: ({ column }) => {
      return (
        <Button
          className='text-center'
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kantor
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.original.kantor}</div>
      )
    }
  },
  {
    accessorKey: "bulan",
    header: ({ column }) => {
      return (
        <Button
          className='text-center'
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bulan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.original.bulan}</div>
      )
    }
  },
  {
    accessorKey: "tahun",
    header: ({ column }) => {
      return (
        <Button
          className='text-center'
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tahun
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.original.tahun}</div>
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
            href={`./biaya-gaji-pegawai/${data.id}`}
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
]
