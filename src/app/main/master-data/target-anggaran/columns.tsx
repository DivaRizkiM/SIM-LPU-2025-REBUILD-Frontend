"use client"

import { Button} from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal} from "lucide-react"
import { ITargetAnggaran } from "../../../../../services/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatCurrency, numFormatter } from "../../../../../helper"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export const columns: ColumnDef<ITargetAnggaran>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "tahun",
    accessorFn: (originalRow) => originalRow?.tahun?.toString(), // matches is a number
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
    }
  },
  {
    accessorKey: "nominal",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nominal Anggaran
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row}) => {
      const data = row.original
      return(
        <span>Rp. {numFormatter(data?.nominal?.toString())}</span>
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
