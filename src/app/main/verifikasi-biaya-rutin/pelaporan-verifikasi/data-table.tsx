"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  getDetailKPRK,
  postAllVerifikasiBiayaRutin,
} from "../../../../../services";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeftCircle, Loader2 } from "lucide-react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { stringifyError } from "../../../../../helper";
import { toast } from "@/components/ui/use-toast";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const searchParams = useSearchParams();
  const triwulan = searchParams.get("triwulan");
  const tahun = searchParams.get("tahun");
  const kcu_id = searchParams.get("kcu_id");
  const kcp_id = searchParams.get("kcp_id");
  const br_id = searchParams.get("br_id");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedID, setSelectedID] = useState<string>("");
  const router = useRouter();
  const [nama_kcu, setNama_kcu] = useState<string>("");
  const [id_regional, setId_regional] = useState<number>();
  const getKcu = async () => {
    if (!kcu_id) return;
    await getDetailKPRK(router, parseInt(kcu_id))
      .then((res) => {
        setNama_kcu(res.data.data.nama);
        setId_regional(res.data.data.id_regional);
      })
      .catch((err) => {
        console.log("Err: ", err);
      });
  };
  useEffect(() => {
    getKcu();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);
  const onSubmitVerifikasiAll = async () => {
    const br_id = searchParams.get("br_id") || "";
    const triwulan = searchParams.get("triwulan") || "";
    const tahun = searchParams.get("tahun") || "";
    const kcu_id = searchParams.get("kcu_id") || "";

    setIsSubmitting(true);

    const payload = {
      data: br_id,
    };

    await postAllVerifikasiBiayaRutin(router, br_id, payload)
      .then(() => {
        toast({
          title: "Berhasil submit verifikasi",
        });

        // Redirect ke halaman "Kembali"
        return router.push(
          `./verifikasi-kcp?kcu_id=${kcu_id}&regID=${id_regional}&tahun=${tahun}&triwulan=${triwulan}`
        );
      })
      .catch((err) => {
        console.log("Err:", err);
        toast({
          title: err?.response?.data?.message || "Terjadi kesalahan",
          variant: "destructive",
        });
      })
      .finally(() => {
        setTimeout(() => {
          setIsSubmitting(false);
        }, 500);
      });
  };

  const getMonth = (no_urut: number) => {
    let triwulan = searchParams.get("triwulan")?.trim();

    switch (no_urut) {
      case 1:
        switch (triwulan) {
          case "1":
            return "Januari";
          case "2":
            return "April";
          case "3":
            return "Juli";
          case "4":
            return "Oktober";
          default:
            break;
        }
      case 2:
        switch (triwulan) {
          case "1":
            return "Februari";
          case "2":
            return "Mei";
          case "3":
            return "Agustus";
          case "4":
            return "November";
          default:
            break;
        }
      case 3:
        switch (triwulan) {
          case "1":
            return "Maret";
          case "2":
            return "Juni";
          case "3":
            return "September";
          case "4":
            return "Desember";
          default:
            break;
        }
    }
  };
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta: {
      getMonth,
      br_id,
      kcu_id,
      kcp_id,
      tahun,
    },
  });

  return (
    <div className="rounded-md border md:px-3 p-2">
      <div className="flex items-center py-4 justify-end flex-wrap gap-2">
        <Link
          href={`./verifikasi-kcp?kcu_id=${kcu_id}&regID=${id_regional}&tahun=${tahun}&triwulan=${triwulan}`}
          className={cn(buttonVariants({ variant: "ghost" }), "me-auto")}
        >
          <ArrowLeftCircle className="me-2" />
          Kembali
        </Link>
        <Button className="text-white" onClick={onSubmitVerifikasiAll}>
          {isSubmitting && <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />}
          Submit
        </Button>
        <Input
          value={nama_kcu}
          readOnly
          className="w-full md:w-min bg-secondary"
        />
        <Input
          value={`${tahun}`}
          readOnly
          className="w-full md:w-min bg-secondary"
        />
        <Input
          value={`triwulan ${triwulan}`}
          readOnly
          className="w-full md:w-min bg-secondary"
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, key) => {
                return (
                  <TableHead
                    key={key}
                    colSpan={header.colSpan}
                    className="border"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={index}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell, key) => (
                  <TableCell key={key} className="border text-[13px]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    {cell.column.id === "number" && index + 1}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={12} className="h-24 text-center">
                {isLoading ? (
                  <div className="mx-auto flex justify-center items-center">
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : (
                  "No results."
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
