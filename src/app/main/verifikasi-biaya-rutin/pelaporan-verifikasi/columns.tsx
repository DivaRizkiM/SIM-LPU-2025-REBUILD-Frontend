"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TooltipButton } from "@/components/tools/tooltip";
import {
  DownloadIcon,
  FilePenIcon,
  Lock,
  LockKeyholeOpen,
} from "lucide-react";

/* ===== Types ===== */
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

/* Rp. 0 atau Rp. 0,00 */
const isZeroRupiah = (v?: string) => /^Rp\.\s?0(,00)?$/.test(v ?? "");

// Helper untuk membandingkan nilai currency
const cleanCurrencyValue = (v?: string) => {
  if (!v) return "0";
  return v.replace(/[^0-9]/g, "");
};

const isSameAmount = (pelaporan?: string, verifikasi?: string) => {
  return cleanCurrencyValue(pelaporan) === cleanCurrencyValue(verifikasi);
};

/* ===== Column Groups per Bulan ===== */
const generateColumnGroup = (monthIndex: number) =>
  columnHelper.group({
    id: `laporan${monthIndex}`,
    header: (ctx) => {
      const meta = ctx.table.options.meta as any;
      return (
        <div className="flex h-8 items-center justify-center bg-sky-950 text-white">
          {meta.getMonth(monthIndex, meta.triwulan)}
        </div>
      );
    },
    columns: [
      {
        header: "Pelaporan",
        cell: (ctx) => {
          const item = ctx.row.original.laporan[monthIndex - 1];
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
        cell: (ctx) => {
          const item = ctx.row.original.laporan[monthIndex - 1];
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

          const item = data.laporan[monthIndex - 1];
          const isLock = !!item?.isLock;
          const isZero = isZeroRupiah(item?.pelaporan);
          const hasLampiran = item?.lampiran === "Y" && !!item?.url_lampiran;

          /* state izin */
          const canView = !isZero; // Bisa lihat detail selama bukan Rp 0
          const canDownload = hasLampiran && !isLock && !isZero;

          /* pesan tooltip */
          const editTooltip = isZero
            ? "Nilai Rp 0, tidak ada yang bisa dilihat"
            : isLock
            ? "Lihat detail (mode terkunci)"
            : "Edit";
          const dlTooltip = !hasLampiran
            ? "Tidak ada lampiran"
            : isLock
            ? "Lampiran terkunci"
            : isZero
            ? "Pelaporan 0 – tidak bisa unduh"
            : "Unduh lampiran";

          return (
            <div className="flex items-center justify-center gap-x-1">
              {/* EDIT/VIEW */}
              {canView ? (
                <Link
                  href={`./detail?ba_id=${meta.br_id}&bulan=${item.bulan}&kode_rek=${data.kode_rekening}&id_kcu=${meta.kcu_id}&kpc_id=${meta.kcp_id}&tahun=${meta.tahun}${isLock ? '&isLock=1' : ''}`}
                  className="flex items-center text-sm text-blue-600 hover:underline"
                  aria-label={isLock ? "Lihat Detail" : "Edit"}
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
                    className={`flex items-center ${
                      hasLampiran ? "text-green-600/40" : "text-muted-foreground/50"
                    } cursor-not-allowed opacity-60`}
                    aria-disabled
                    tabIndex={-1}
                  >
                    <DownloadIcon className="me-1 h-4 w-4" />
                  </span>
                </TooltipButton>
              )}

              {/* STATUS KUNCI */}
              {isLock ? (
                <TooltipButton tooltipText="Akses edit terkunci">
                  <Lock className="h-[10px] w-[10px] text-red-800" />
                </TooltipButton>
              ) : (
                <TooltipButton tooltipText="Akses edit terbuka">
                  <LockKeyholeOpen className="h-[10px] w-[10px]" />
                </TooltipButton>
              )}
            </div>
          );
        },
      },
    ],
  });

/* ===== Export Columns ===== */
export const columns: ColumnDef<VerifikasiAtribusiI>[] = [
  { accessorKey: "number", header: "No" },
  { accessorKey: "kode_rekening", header: "Kode Rekening" },
  { accessorKey: "nama_rekening", header: "Nama Rekening" },
  generateColumnGroup(1),
  generateColumnGroup(2),
  generateColumnGroup(3),
];
