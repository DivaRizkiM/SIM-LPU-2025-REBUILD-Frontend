"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  DownloadIcon,
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
import Link from "next/link";
import { TooltipButton } from "@/components/tools/tooltip";

// This type is used to define the shape of our data.
export interface VerifikasiAtribusiI {
  id_verifikasi_biaya_rutin: string;
  kode_rekening: string;
  nama_rekening: string;
  laporan: {
    bulan_string: string;
    bulan: number;
    pelaporan: string;
    verifikasi: string;
    isLock: boolean;
    lampiran: "N" | "Y";
    url_lampiran: string;
  }[];
}

const columnHelper = createColumnHelper<VerifikasiAtribusiI>();

// Helper: cek Rp. 0 atau Rp. 0,00
const isZeroRupiah = (v?: string) => /^Rp\.\s?0(,00)?$/.test(v ?? "");

const generateColumnGroup = (monthIndex: number) => {
  return columnHelper.group({
    id: `laporan${monthIndex}`,
    header: (ctx) => {
      const meta = ctx.table.options.meta as any;
      return (
        <div className="flex h-8 items-center justify-center bg-sky-950 text-center text-white">
          {meta.getMonth(monthIndex, (ctx.table.options.meta as any).triwulan)}
        </div>
      );
    },
    columns: [
      {
        header: "Pelaporan",
        cell: (ctx) => {
          const data = ctx.row.original;
          return (
            <div className="text-nowrap">
              {data.laporan[monthIndex - 1].pelaporan}
            </div>
          );
        },
      },
      {
        header: "Verifikasi",
        cell: (ctx) => {
          const data = ctx.row.original;
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

          const item = data.laporan[monthIndex - 1];
          const isLock = !!item?.isLock;
          const canEdit = !isLock && !isZeroRupiah(item?.pelaporan);
          const hasLampiran = item?.lampiran === "Y" && !!item?.url_lampiran;

          // jika pelaporan 0, tidak ada aksi sama sekali
          if (isZeroRupiah(item?.pelaporan)) return null;

          return (
            <div className="flex items-center justify-center gap-x-1">
              {/* EDIT (nonaktif ketika lock atau pelaporan 0) */}
              {canEdit ? (
                <Link
                  href={`./detail?ba_id=${meta.br_id}&bulan=${item.bulan}&kode_rek=${data.kode_rekening}&id_kcu=${meta.kcu_id}&kpc_id=${meta.kcp_id}&tahun=${meta.tahun}`}
                  className="flex items-center text-sm text-blue-600 hover:underline"
                >
                  <FilePenIcon className="me-1 h-4 w-4" />
                </Link>
              ) : (
                <TooltipButton
                  tooltipText={
                    isLock ? "Akses Edit Terkunci" : "Tidak ada nilai untuk diedit"
                  }
                >
                  <span className="flex cursor-not-allowed items-center text-blue-600/50">
                    <FilePenIcon className="me-1 h-4 w-4" />
                  </span>
                </TooltipButton>
              )}

              {/* DOWNLOAD (ikut terkunci kalau isLock = true) */}
              {hasLampiran && !isLock ? (
                <a
                  href={item.url_lampiran}
                  download
                  className="flex items-center text-sm text-green-600 hover:underline"
                >
                  <DownloadIcon className="me-1 h-4 w-4" />
                </a>
              ) : hasLampiran && isLock ? (
                <TooltipButton tooltipText="Lampiran terkunci">
                  <span
                    className="flex cursor-not-allowed items-center text-green-600/50"
                    aria-disabled
                    tabIndex={-1}
                  >
                    <DownloadIcon className="me-1 h-4 w-4" />
                  </span>
                </TooltipButton>
              ) : (
                <span className="flex items-center text-xs text-red-700">
                  <DownloadIcon className="me-1 h-4 w-4" />
                </span>
              )}

              {/* STATUS KUNCI */}
              {isLock ? (
                <TooltipButton tooltipText={"Akses Edit Terkunci"}>
                  <Lock className="h-[10px] w-[10px] text-red-800" />
                </TooltipButton>
              ) : (
                <TooltipButton tooltipText={"Akses Edit terbuka"}>
                  <LockKeyholeOpen className="h-[10px] w-[10px]" />
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
  { accessorKey: "number", header: "No" },
  { accessorKey: "kode_rekening", header: "Kode Rekening" },
  { accessorKey: "nama_rekening", header: "Nama Rekening" },
  generateColumnGroup(1),
  generateColumnGroup(2),
  generateColumnGroup(3),
];
