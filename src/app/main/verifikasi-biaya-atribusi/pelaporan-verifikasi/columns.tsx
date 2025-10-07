"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { TooltipButton } from "@/components/tools/tooltip";
import {
  DownloadIcon,
  FilePenIcon,
  Lock,
  LockKeyholeOpen,
} from "lucide-react";

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
    lampiran?: string;      // "Y" | "N"
    url_lampiran?: string;
  }[];
}

const columnHelper = createColumnHelper<VerifikasiAtribusiI>();

// Rp. 0 atau Rp. 0,00 (dengan/ tanpa spasi)
const isZeroRupiah = (v?: string) => /^Rp\.\s?0(,00)?$/.test(v ?? "");

const generateColumnGroup = (monthIndex: number) =>
  columnHelper.group({
    id: `laporan${monthIndex}`,
    header: (ctx) => (
      <div className="flex h-8 items-center justify-center bg-sky-950 text-white">
        {(ctx.table.options.meta as any).getMonth(monthIndex)}
      </div>
    ),
    columns: [
      {
        header: "Pelaporan",
        cell: (ctx) => {
          const item = ctx.row.original.laporan[monthIndex - 1];
          return <div className="text-nowrap">{item.pelaporan}</div>;
        },
      },
      {
        header: "Verifikasi",
        cell: (ctx) => {
          const item = ctx.row.original.laporan[monthIndex - 1];
          return <div className="text-nowrap">{item.verifikasi}</div>;
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
          const isZero = isZeroRupiah(item?.pelaporan);

          const hasLampiran = item?.lampiran === "Y" && !!item?.url_lampiran;

          const canEdit = !isLock && !isZero;
          const canDownload = hasLampiran && !isLock && !isZero;

          const editTooltip = isLock
            ? "Akses edit terkunci"
            : isZero
            ? "Nilai Rp 0, tidak ada yang bisa diedit"
            : "Edit";
          const dlTooltip = !hasLampiran
            ? "Tidak ada lampiran"
            : isLock
            ? "Lampiran terkunci"
            : isZero
            ? "Pelaporan 0 – tidak bisa unduh"
            : "Unduh lampiran";

          return (
            <div className="flex items-center justify-center gap-x-2">
              {/* EDIT */}
              {canEdit ? (
                <Link
                  href={`./detail?ba_id=${meta.ba_id}&bulan=${item.bulan}&kode_rek=${data.kode_rekening}&id_kcu=${meta.kcu_id}&tahun=${meta.tahun}`}
                  className="flex items-center text-sm text-blue-600 hover:underline"
                  aria-label="Edit"
                >
                  <FilePenIcon className="me-1 h-4 w-4" />
                </Link>
              ) : (
                <TooltipButton tooltipText={editTooltip}>
                  <span
                    className="flex cursor-not-allowed items-center text-blue-600/40 opacity-60"
                    aria-disabled
                    tabIndex={-1}
                  >
                    <FilePenIcon className="me-1 h-4 w-4" />
                  </span>
                </TooltipButton>
              )}

              {/* DOWNLOAD */}
              {canDownload ? (
                <a
                  href={item.url_lampiran}
                  download
                  className="flex items-center text-sm text-green-600 hover:underline"
                  aria-label="Unduh lampiran"
                >
                  <DownloadIcon className="me-1 h-4 w-4" />
                </a>
              ) : (
                <TooltipButton tooltipText={dlTooltip}>
                  <span
                    className={`flex items-center cursor-not-allowed opacity-60 ${
                      hasLampiran ? "text-green-600/50" : "text-muted-foreground/50"
                    }`}
                    aria-disabled
                    tabIndex={-1}
                  >
                    <DownloadIcon className="me-1 h-4 w-4" />
                  </span>
                </TooltipButton>
              )}

              {/* STATUS KUNCI */}
              {isLock ? (
                <TooltipButton tooltipText="Akses Edit Terkunci">
                  <Lock className="h-[10px] w-[10px] text-red-800" />
                </TooltipButton>
              ) : (
                <TooltipButton tooltipText="Akses Edit Terbuka">
                  <LockKeyholeOpen className="h-[10px] w-[10px]" />
                </TooltipButton>
              )}
            </div>
          );
        },
      },
    ],
  });

export const columns: ColumnDef<VerifikasiAtribusiI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) =>
      (table
        .getSortedRowModel()
        ?.flatRows?.findIndex((r) => r.id === row.id) || 0) + 1,
  },
  { accessorKey: "kode_rekening", header: "Kode Rekening" },
  { accessorKey: "nama_rekening", header: "Nama Rekening" },
  generateColumnGroup(1),
  generateColumnGroup(2),
  generateColumnGroup(3),
];
