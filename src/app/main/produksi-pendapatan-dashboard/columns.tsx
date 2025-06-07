"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { numFormatter, separateDate } from "../../../../helper"
import { ProduksiPendapatanI } from "../../../../services/types"

export const columns: ColumnDef<ProduksiPendapatanI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "bulan",
    // accessorFn: (originalRow) => originalRow.bulan.toString(), // matches is a number
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
      const { month} = separateDate(row.original.tanggal)
      
      return(
        // <div className="text-center">{row.original.bulan}</div>
        <div className="text-center">{month}</div>
      )
    }
  },
  {
    accessorKey: "tahun",
    // accessorFn: (originalRow) => originalRow.bulan.toString(), // matches is a number
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
    cell: ({row}) => {
      const { year} = separateDate(row.original.tanggal)
      
      return(
        // <div className="text-center">{row.original.bulan}</div>
        <div className="text-center">{year}</div>
      )
    }
  },
  {
    accessorKey: "group_produk",
    // accessorFn: (originalRow) => originalRow.tahun.toString(), // matches is a number
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Grup Produk
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "bisnis",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bisnis
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "jml_produksi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jumlah Produksi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => {
      return(
        <div className="text-center">{numFormatter(row.original.jml_produksi)}</div>
      )
    }
  },
  {
    accessorKey: "jml_pendapatan",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jumlah Pendapatan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => {
      return(
        <div className="text-center">Rp. {numFormatter(row.original.jml_pendapatan)}</div>
      )
    }
  },
  {
    accessorKey: "koefisien",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Koefisien
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => {
      return(
        <div className="text-center">{numFormatter(row.original.koefisien)}</div>
      )
    }
  },
  {
    accessorKey: "transfer_pricing",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Transfer Pricing
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({row}) => {
      return(
        <div className="text-center">{numFormatter(row.original.transfer_pricing)}</div>
      )
    }
  },
]
