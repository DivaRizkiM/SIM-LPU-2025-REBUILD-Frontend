"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { Edit, Edit2, TableProperties, Trash, Users2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export interface ProfilKcpI {
  id: number,
  id_regional: number,
  id_kprk: number,
  nomor_dirian: string ,
  nama: string,
  jenis_kantor: string,
  alamat: string,
  koordinat_longitude: string,
  koordinat_latitude: string,
  nomor_telpon: string,
  nomor_fax: string,
  id_provinsi: string,
  id_kabupaten_kota: string,
  id_kecamatan: string,
  id_kelurahan: string,
  tipe_kantor: string,
  jam_kerja_senin_kamis:string,
  jam_kerja_jumat:string,
  jam_kerja_sabtu: string,
  frekuensi_antar_ke_alamat: string,
  frekuensi_antar_ke_dari_kprk: string,
  jumlah_tenaga_kontrak: string,
  kondisi_gedung: string,
  fasilitas_publik_dalam: string,
  fasilitas_publik_halaman: string,
  lingkungan_kantor: string,
  lingkungan_sekitar_kantor: string,
  tgl_sinkronisasi: string,
  id_user: string,
  tgl_update: string,
  id_file: string,
  nama_regional: string,
  nama_kprk:string 
}

export const columns: ColumnDef<ProfilKcpI>[] = [
  // {
  //   header: 'No',
  //   id: 'id',
  //   cell: ({ row, table }) => (table.getSortedRowModel()?.flatRows?.findIndex((flatRow) => flatRow.id === row.id) || 0) + 1,
  // },
  {
    accessorKey: "id_regional",
    accessorFn: (originalRow) => originalRow.id_regional.toString(), // matches is a number
  },
  {
    accessorKey: "id_kprk",
    accessorFn: (originalRow) => originalRow.id_kprk.toString(), // matches is a number
  },
  {
    accessorKey: "nama_regional",
    header: 'Nama Regional'
  },
  {
    accessorKey: "nama_kprk",
    header: 'KC / KCU'
  },
  {
    accessorKey: "frekuensi_antar_ke_dari_kprk",
    header: 'Jarak Kantor ke KC / KCU'
  },
  {
    accessorKey: "nomor_dirian",
    header: 'Nomor Dirian'
  },
  {
    accessorKey: "nama",
    header: 'Nama Kantor Pos'
  },
  {
    accessorKey: "jenis_kantor",
    header: 'Jenis Kantor'
  },
  {
    accessorKey: "tipe_kantor",
    header: 'Tipe Kantor'
  },
  {
    accessorKey: "jam_layanan",
    header: 'Jam Layanan',
    cell: ({ row }) => {
      const data = row.original
 
      return (
        <ul className="list-disc ms-1">
          <li>senin-kamis: {data.jam_kerja_senin_kamis && data.jam_kerja_senin_kamis+' WIB' }</li>
          <li>Jum&apos;at: {data.jam_kerja_jumat && data.jam_kerja_jumat+' WIB'}</li>
          <li>Sabtu: {data.jam_kerja_sabtu && data.jam_kerja_sabtu+' WIB'}</li>
        </ul>
      )
    },
  },
  {
    id: "actions",
    header: 'Aksi',
    cell: ({ row,table }) => {
      const data = row.original
      const meta = (table.options.meta as any)
 
      return (
        <div className="flex flex-wrap gap-1">
          <Link 
            href={`profilKCP/${data.id}/edit`} 
            className={cn(
              buttonVariants({size:'icon',variant:'outline'})
          )}>
            <Edit className="w-4 h-4"/>
          </Link>
          <Link 
            href={`profilKCP/${data.id}/petugas`} 
            className={cn(
              buttonVariants({size:'icon',variant:'outline'})
          )}>
            <Users2 className="w-4 h-4"/>
          </Link>
          <Button 
            onClick={()=>meta.onClickDelete(data)}
            size='icon' 
            variant='outline'
          >
            <Trash className="w-4 h-4"/>
          </Button>
        </div>
      )
    },
  }
]
