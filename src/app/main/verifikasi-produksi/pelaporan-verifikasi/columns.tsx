"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  FilePenIcon,
  Lock,
  LockKeyholeOpen,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipButton } from "@/components/tools/tooltip";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface VerifikasiAtribusiI {
  id: string;
  kode_rekening: string;
  nama_rekening: string;
  jenis_layanan: string;
  aktifitas: string;
  produk_keterangan: string;
  laporan: {
    id_produksi_detail: string;
    jenis_layanan: string;
    aktifitas: string;
    produk_keterangan: string;
    bulan_string: string;
    bulan: number;
    pelaporan: string;
    verifikasi: string;
    isLock: boolean;
  }[];
}

const columnHelper = createColumnHelper<VerifikasiAtribusiI>();

// Helper untuk membandingkan nilai currency
const cleanCurrencyValue = (v?: string) => {
  if (!v) return "0";
  return v.replace(/[^0-9]/g, "");
};

const isSameAmount = (pelaporan?: string, verifikasi?: string) => {
  return cleanCurrencyValue(pelaporan) === cleanCurrencyValue(verifikasi);
};

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
          const item = data.laporan[monthIndex - 1];
          const isSame = isSameAmount(item.pelaporan, item.verifikasi);
          return (
            <div 
              className={`text-nowrap font-semibold px-2 py-1 rounded ${
                isSame 
                  ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950" 
                  : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950"
              }`}
            >
              {item.pelaporan}
            </div>
          );
        },
      },
      {
        header: "Verifikasi",
        cell: (row) => {
          const data = row.row.original;
          const item = data.laporan[monthIndex - 1];
          const isSame = isSameAmount(item.pelaporan, item.verifikasi);
          return (
            <div 
              className={`text-nowrap font-semibold px-2 py-1 rounded ${
                isSame 
                  ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950" 
                  : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950"
              }`}
            >
              {item.verifikasi}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row, table }) => {
          const data = row.original;
          const meta = table.options.meta as any;
          const isLock = data.laporan[monthIndex - 1].isLock;

          if (data.laporan[monthIndex - 1].pelaporan === "Rp. 0,00") return;
          return (
            <div className="flex items-center justify-center gap-x-1">
              <button
                onClick={() =>
                  meta.onClickEditData(
                    data.laporan[monthIndex - 1].id_produksi_detail,
                    isLock
                  )
                }
                className="flex items-center text-sm text-blue-600 hover:underline"
              >
                <FilePenIcon className="w-4 h-4 me-1" />
              </button>

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
    accessorKey: "jenis_layanan",
    header: "Jenis Layanan",
  },
  {
    accessorKey: "produk_keterangan",
    header: "Produk (Keterangan)",
  },
  {
    accessorKey: "aktifitas",
    header: "Aktivitas (Nama Kegiatan)",
  },
  generateColumnGroup(1),
  generateColumnGroup(2),
  generateColumnGroup(3),
];
