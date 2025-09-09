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
                    data.laporan[monthIndex - 1].id_produksi_detail
                  )
                }
                disabled={isLock}
                className={`flex items-center text-sm text-blue-600 hover:underline ${
                  isLock ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FilePenIcon className="w-4 h-4 me-1" />
                {isLock && (
                  <Lock className="ms-1 w-[10px] h-[10px] text-red-800" />
                )}
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
