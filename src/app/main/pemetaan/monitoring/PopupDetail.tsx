import { FC } from "react";
import { KPCKoordinat } from "../../../../../services/types";

interface PopupDetailI {
    data: KPCKoordinat
}

const PopupDetail:FC<PopupDetailI> = ({data})=> {
    return(
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
                <span className="font-semibold">Nama Kantor:</span>
                <span>{data.nama}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">ID Kantor:</span>
                <span>{data.id_kpc}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">Nama Penyelenggara:</span>
                <span>{data.nama_kprk}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">Alamat:</span>
                <span>{data.alamat}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">Koordinat:</span>
                <span>{`${data.koordinat_latitude}, ${data.koordinat_longitude}`}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">Jenis Kantor:</span>
                <span>{data.jenis_kantor}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">Provinsi:</span>
                <span>{data.id_provinsi}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">Kabupaten:</span>
                <span>{data.id_kabupaten_kota}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">Kecamatan:</span>
                <span>{data.id_kecamatan}</span>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">Kelurahan:</span>
                <span>{data.id_kelurahan}</span>
            </div>
            </div>
      </div>
    )
}

export default PopupDetail