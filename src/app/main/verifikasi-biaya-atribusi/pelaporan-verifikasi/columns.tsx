"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  ArrowUpDown,
  DownloadCloud,
  DownloadIcon,
  FilePenIcon,
  Lock,
  LockKeyholeOpen,
  MoreHorizontal,
  TableProperties,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { TooltipButton } from "@/components/tools/tooltip";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface VerifikasiAtribusiI {
  id: string;
  kode_rekening: string;
  nama_rekening: string;
  laporan: {
    bulan_string: string;
    bulan: number;
    pelaporan: string;
    verifikasi: string;
    isLock: boolean;
    lampiran?: string;
    url_lampiran?: string;
  }[];
}

const columnHelper = createColumnHelper<VerifikasiAtribusiI>();

const generateColumnGroup = (monthIndex: number) => {
  return columnHelper.group({
    id: `laporan${monthIndex}`,
    header: (row) => (
      <div className="text-center text-white bg-sky-950 h-8 flex items-center justify-center">
        {(row.table.options.meta as any).getMonth(monthIndex)}
      </div>
    ),
    columns: [
      {
        header: "Pelaporan",
        cell: (row) => {
          const data = row.row.original;
          return (
            <div className="text-nowrap">
              {data.laporan[monthIndex - 1].pelaporan}
            </div>
          );
        },
      },
      {
        header: "Verifikasi",
        cell: (row) => {
          const data = row.row.original;
          return (
            <div className="text-nowrap">
              {data.laporan[monthIndex - 1].verifikasi}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Aksii",
        cell: ({ row, table }) => {
          const data = row.original;
          const meta = table.options.meta as any;
          const monthData = data.laporan[monthIndex - 1];
          const isLock = monthData.isLock;

          if (monthData.pelaporan === "Rp. 0,00") return;

          return (
            <div className="flex items-center justify-center gap-x-2">
              {monthData.pelaporan !== "Rp. 0" && !isLock && (
                <Link
                  href={`./detail?ba_id=${meta.ba_id}&bulan=${monthData.bulan}&kode_rek=${data.kode_rekening}&id_kcu=${meta.kcu_id}&tahun=${meta.tahun}`}
                  className={`flex items-center text-sm text-blue-600 hover:underline ${
                    isLock ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  <FilePenIcon className="w-4 h-4 me-1" />
                  {isLock && (
                    <Lock className="ms-1 w-[10px] h-[10px] text-red-800" />
                  )}
                </Link>
              )}
              {/* Download Button */}
              {monthData?.lampiran === "Y" ? (
                <a
                  href={monthData?.url_lampiran}
                  download
                  className="flex items-center text-sm text-green-600 hover:underline"
                >
                  <DownloadIcon className="w-4 h-4 me-1" />
                </a>
              ) : (
                <div className="flex items-center text-xs text-red-600 italic">
                  <DownloadIcon className="w-4 h-4 me-1" />
                </div>
              )}

              {/* Lock Tooltip */}
              {isLock ? (
                <TooltipButton tooltipText="Akses Edit Terkunci">
                  <Lock className="w-[10px] h-[10px] text-red-800" />
                </TooltipButton>
              ) : (
                <TooltipButton tooltipText="Akses Edit Terbuka">
                  <LockKeyholeOpen className="w-[10px] h-[10px]" />
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
    cell: ({ row, table }) =>
      (table
        .getSortedRowModel()
        ?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
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
];
