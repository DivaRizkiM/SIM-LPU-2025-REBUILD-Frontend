"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { ArrowUpDown, DownloadCloud, DownloadIcon, FilePenIcon, Lock, LockKeyholeOpen, MoreHorizontal, TableProperties } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { TooltipButton } from "@/components/tools/tooltip"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface VerifikasiAtribusiI {
  id: string
  kode_rekening:string
  nama_rekening:string
  laporan: {     
      bulan_string: string,
      bulan: number,
      pelaporan: string,
      verifikasi: string,
      isLock: boolean
  }[],
}

const columnHelper = createColumnHelper<VerifikasiAtribusiI>()

const generateColumnGroup = (monthIndex:number) => {
  return columnHelper.group({
    id: `laporan${monthIndex}`,
    header: (row) => (
      <div className="text-center text-white bg-sky-950 h-8 flex items-center justify-center">
        {(row.table.options.meta as any).getMonth(monthIndex)}
      </div>
    ),
    columns: [
      {
        header: 'Pelaporan',
        cell: (row) => {
          const data = row.row.original;
          return <div className="text-nowrap">{data.laporan[monthIndex - 1].pelaporan}</div>;
        },
      },
      {
        header: 'Verifikasi',
        cell: (row) => {
          const data = row.row.original;
          return <div className="text-nowrap">{data.laporan[monthIndex - 1].verifikasi}</div>;
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row,table }) => {
          const data = row.original;
          const meta = (table.options.meta as any)
          const isLock = data.laporan[monthIndex-1].isLock

          if (data.laporan[monthIndex-1].pelaporan === "Rp. 0,00")return 
          return (
            <div className="flex items-center justify-center gap-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 mx-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  <Link href={`./detail?ba_id=${meta.ba_id}&bulan=${data.laporan[monthIndex-1].bulan}&kode_rek=${data.kode_rekening}&id_kcu=${meta.kcu_id}&tahun=${meta.tahun}`} className={isLock ? 'pointer-events-none opacity-50': ''}>
                    <DropdownMenuItem 
                    >
                      <FilePenIcon className="w-4 h-4 me-2"/>
                      Edit
                      {isLock && (
                        <Lock className="ms-2 w-[10px] h-[10px] text-red-800"/> 
                      )}
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem>
                    <DownloadIcon className="w-4 h-4 me-2"/>
                    Download
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          );
        },
      },
    ],
  });
};

export const columns: ColumnDef<VerifikasiAtribusiI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "kode_rekening",
    header: "Kode Rekening",
  },
  {
    accessorKey: "nama_rekening",
    header: "Nama Rekening",
  },
  generateColumnGroup(1),
  generateColumnGroup(2),
  generateColumnGroup(3),
]
