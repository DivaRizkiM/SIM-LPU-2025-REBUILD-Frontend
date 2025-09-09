"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, FilePenIcon, Lock, LockKeyholeOpen, TableProperties, Trash, Check, X } from "lucide-react"
import { buildQueryParam, numFormatter, separateDate, stringifyError } from "../../../../helper"
import { ProduksiPendapatanI } from "../../../../services/types"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { TooltipButton } from '@/components/tools/tooltip'
import { deleteProduksiPendapatan } from '../../../../services'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

import { Badge } from "@/components/ui/badge"

// Create action components that can use hooks
const ActionCell = ({ data }: { data: ProduksiPendapatanI }) => {
  const router = useRouter();
  const isLock = data.isLock;

  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        await deleteProduksiPendapatan(router, data.id);
        toast({
          title: 'Berhasil hapus data dashboard produksi & pendapatan'
        });
        // Refresh table data
        window.location.reload();
      } catch (err: any) {
        console.log("Err: ", err);
        toast({
          title: err.response?.data?.message || err.message,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <TooltipButton tooltipText="Edit Data">
        <Link
          href={`produksi-pendapatan-dashboard/${data.id}`}
          className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-8 w-8 text-blue-600 hover:bg-blue-50 ${isLock ? "pointer-events-none opacity-50" : ""}`}
        >
          <FilePenIcon className="w-4 h-4" />
        </Link>
      </TooltipButton>

      <TooltipButton tooltipText="Hapus Data">
        <Button
          onClick={handleDelete}
          disabled={isLock}
          size="sm"
          variant="ghost"
          className={`h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 ${isLock ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </TooltipButton>

      <TooltipButton tooltipText={isLock ? "Akses Edit Terkunci" : "Akses Edit Terbuka"}>
        {isLock ? (
          <Lock className="w-4 h-4 text-red-600" />
        ) : (
          <LockKeyholeOpen className="w-4 h-4 text-green-600" />
        )}
      </TooltipButton>
    </div>
  );
};

const SubmitCell = ({ data }: { data: ProduksiPendapatanI }) => {
  const router = useRouter();
  const isLock = data.isLock;

  const handleSubmit = async () => {
    try {
      // Add your submit API call here
      // await submitProduksiPendapatan(router, data.id);

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Data berhasil disubmit',
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.log("Err: ", err);
      toast({
        title: stringifyError(err.response?.data?.message || err.message),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleSubmit}
        disabled={isLock}
        size="sm"
        className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs ${isLock ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        Submit
      </Button>
    </div>
  );
};

export const columns: ColumnDef<ProduksiPendapatanI>[] = [
  {
    accessorKey: "number",
    header: "No",
    cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  },
  {
    accessorKey: "bulan",
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
    cell: ({ row }) => {
      const { month } = separateDate(row.original.tanggal)
      return (
        <div className="text-center">{month}</div>
      )
    }
  },
  {
    accessorKey: "tahun",
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
    cell: ({ row }) => {
      const { year } = separateDate(row.original.tanggal)
      return (
        <div className="text-center">{year}</div>
      )
    }
  },
  {
    accessorKey: "group_produk",
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
    cell: ({ row }) => {
      return (
        <div className="text-center">{numFormatter(row.original.jml_produksi)}</div>
      )
    }
  },
  {
    accessorKey: "verifikasi_produksi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Verifikasi Jumlah Produksi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const verifikasiValue = row.original.verifikasi_jumlah_produksi;
      return (
        <div className="text-center">
          {verifikasiValue ? numFormatter(verifikasiValue) : '-'}
        </div>
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
    cell: ({ row }) => {
      return (
        <div className="text-center">Rp. {numFormatter(row.original.jml_pendapatan)}</div>
      )
    }
  },
  {
    accessorKey: "verifikasi_pendapatan",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Verifikasi Jumlah Pendapatan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const verifikasiValue = row.original.verifikasi_jumlah_pendapatan;
      return (
        <div className="text-center">
          Rp. {verifikasiValue ? numFormatter(verifikasiValue) : '-'}
        </div>
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
    cell: ({ row }) => {
      return (
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
    cell: ({ row }) => {
      return (
        <div className="text-center">{numFormatter(row.original.transfer_pricing)}</div>
      )
    }
  },

  {
    id: "actions",
    header: 'Aksi',
    cell: ({ row }) => {
      const data = row.original;
      return <ActionCell data={data} />;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const data = row.original

      const getStatusColor = () => {
        switch (data.status) {
          case 'Sudah Verifikasi':
            return 'success'
          default:
            return 'secondary'
        }
      }
      return (
        <Badge variant={getStatusColor()}>{data.status}</Badge>
      )
    },
  },
]