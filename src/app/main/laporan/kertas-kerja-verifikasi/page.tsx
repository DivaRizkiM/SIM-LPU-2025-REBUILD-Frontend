"use client";
import { NextPage } from "next";
import style from "./index.module.css";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tahunData, triwulanData } from "@/lib/data";
import Combobox from "@/components/tools/combobox";
import { useEffect, useState } from "react";
import { FormCustomOption } from "../../../../../store/state";
import {
  getExportKertasKerjaVerifikasi,
  getKertasKerjaVerifikasi,
  getRegional,
} from "../../../../../services";
import { useRouter } from "next/navigation";
import { RegionalI } from "../../referensi/regional/columns";
import { IkertasKerjaLaporan } from "../../../../../services/types";
import {
  QueryParams,
  buildQueryParam,
  isLastPage,
  numFormatter,
} from "../../../../../helper";
import { Download, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { PaginationI } from "@/lib/types";
import Paginator from "@/components/tools/paginator";

const KertasKerjaVerifikasi: NextPage = () => {
  const router = useRouter();
  const [page, setPage] = useState<number>(1);
  const pageSize: number = 10;
  const [offset, setOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tahunSelected, setTahunSelected] = useState<string>("");
  const [triwulanSelected, setTriwulanSelected] = useState<string>("");
  const [dataSource, setDataSource] = useState<IkertasKerjaLaporan[]>();
  const [regionalSelected, setRegionalSelected] = useState<string>("");
  const [regionalOptions, setRegionalOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [isRegionalLoading, setIsRegionalLoading] = useState<boolean>(false);
  const [isExportLoading, setIsExportLoading] = useState<boolean>(false);

  const [pagination, setPagination] = useState<PaginationI>({
    currentPage: 1,
    totalPages: 0,
    startItem: 0,
    endItem: 0,
    total_data: 0,
  });

  const firstInit = async () => {
    setIsRegionalLoading(true);
    await getRegional(router, "?limit=99")
      .then((response) => {
        let regionals: Array<any> = response.data.data.map(
          (item: RegionalI) => ({
            value: item.id.toString(),
            label: item.nama,
          })
        );
        regionals.unshift({
          value: "all",
          label: "Semua regional",
        });
        setRegionalOptions(regionals);
      })
      .catch((err) => {
        console.log("Err: ", err);
      })
      .finally(() => {
        setIsRegionalLoading(false);
      });

    fetchData(page, tahunSelected, triwulanSelected, regionalSelected);
  };
  useEffect(() => {
    firstInit();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  const fetchData = async (
    pagination = 1,
    tahun = "",
    triwulan = "",
    regional = ""
  ) => {
    setIsLoading(true);
    const tempParams: QueryParams = {};

    if (tahun && tahun != "all") {
      tempParams.tahun = tahun;
    }
    if (triwulan && triwulan != "all") {
      tempParams.triwulan = triwulan;
    }
    if (regional && regional != "all") {
      tempParams.id_regional = regional;
    }
    const offset = (pagination - 1) * pageSize;
    tempParams.offset = offset.toString();
    tempParams.limit = pageSize.toString();
    const params = buildQueryParam(tempParams) || "";
    if (offset < 0) return;
    await getKertasKerjaVerifikasi(router, params)
      .then((res) => {
        const { offset, limit, total_data } = res.data as any;
        const currentPage: number = Math.floor(offset / limit) + 1;
        const totalPages: number = Math.ceil(total_data / limit);
        const startItem: number = parseInt(offset) + 1;
        const endItem: number = Math.min(
          parseInt(offset) + parseInt(limit),
          total_data
        );
        setPagination({
          currentPage,
          totalPages,
          startItem,
          endItem,
          total_data,
        });
        setDataSource(res.data.data);
        setOffset(parseInt((res.data as any).offset) || 0);
      })
      .catch((res) => {
        console.log(res);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const exportData = async () => {
    setIsExportLoading(true);
    const tempParams: QueryParams = {};

    if (tahunSelected && tahunSelected != "") {
      tempParams.tahun = tahunSelected;
    }
    if (triwulanSelected && triwulanSelected != "") {
      tempParams.triwulan = triwulanSelected;
    }
    if (regionalSelected && regionalSelected != "") {
      tempParams.id_regional = regionalSelected;
    }
    const params = buildQueryParam(tempParams) || "";
    await getExportKertasKerjaVerifikasi(router, params)
      .then((res) => {
        const url = window.URL.createObjectURL(res.data as any);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        const fileNameParts = [`kertas_kerja_verifikasi`];

        // Tambahkan tahunSelected jika ada nilainya
        if (tahunSelected) {
          fileNameParts.push(tahunSelected);
        }

        // Tambahkan triwulanSelected jika ada nilainya
        if (triwulanSelected) {
          fileNameParts.push(triwulanSelected);
        }

        // Tambahkan regionalSelected jika ada nilainya
        if (regionalSelected) {
          fileNameParts.push(regionalSelected);
        }

        // Gabungkan semua bagian nama file dengan underscore
        const fileName = fileNameParts.join("_") + ".xlsx";

        // Setel nama file yang dihasilkan
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.log("res export data error: ", err);
        toast({
          title: err.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsExportLoading(false);
      });
  };

  const filterByTahun = (value: string) => {
    setTahunSelected(value);
    setPage(1);
    fetchData(1, value, triwulanSelected, regionalSelected);
  };
  const filterByTriwulan = (value: string) => {
    setPage(1);
    setTriwulanSelected(value);
    fetchData(1, tahunSelected, value, regionalSelected);
  };
  const filterByRegional = (value: string) => {
    setPage(1);
    setRegionalSelected(value);
    fetchData(1, tahunSelected, triwulanSelected, value);
  };

  return (
    <div className="px-3 md:px-7 mt-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full md:w-auto">
        <Button className="" onClick={exportData}>
          {isExportLoading ? (
            <Loader2 className="me-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="me-2 w-4 h-4" />
          )}
          Export Excel
        </Button>
        <Select value={tahunSelected} onValueChange={filterByTahun}>
          <SelectTrigger className="md:col-start-3">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"all"}>Semua Tahun</SelectItem>
              {tahunData.map((t, index) => (
                <SelectItem value={t.value} key={index}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select value={triwulanSelected} onValueChange={filterByTriwulan}>
          <SelectTrigger className="">
            <SelectValue placeholder="Triwulan" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={"all"}>Semua Triwulan</SelectItem>
              {triwulanData.map((t, index) => (
                <SelectItem value={t.value} key={index}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="">
          <Combobox
            value={regionalSelected}
            options={regionalOptions}
            placeholder={"Regional"}
            onSelect={filterByRegional}
          />
        </div>
      </div>
      <h1 className="text-center my-7 md:my-3">
        KERTAS KERJA VERIFIKASI DOKUMEN <br />
        PENYELENGGARAAN LAYANAN POS UNIVERSAL PT. POS INDONESIA
      </h1>
      <div className={`relative overflow-x-scroll`}>
        <table className={style.table}>
          <thead className="[&:nth-child(3):bg-red-900]">
            {/* First row of header group */}
            <tr>
              <th rowSpan={3}>No</th>
              <th rowSpan={3}>Kantor Pos Pemeriksa</th>
              <th rowSpan={3}>Jumlah KCP LPU</th>
              <th colSpan={4}>REKAPITULASI PRODUKSI DAN REALISASI</th>
              <th colSpan={2} rowSpan={2}>
                DEVIASI LAPORAN KC / KCU DGN HASIL VERIFIKASI{" "}
              </th>
              <th rowSpan={3}>DEVIASI PRODUKSI DGN BIAYA HASIL VERIFIKASI</th>
              <th rowSpan={3}>Action</th>
            </tr>
            {/* Second row of header group */}
            <tr>
              <th colSpan={2}>Laporan KC / KCU</th>
              <th colSpan={2}>Hasil Verifikasi</th>
            </tr>
            {/* Third row of header group */}
            <tr>
              <th>Biaya</th>
              <th>Produksi</th>
              <th>Biaya</th>
              <th>Produksi</th>
              <th>Biaya</th>
              <th>Produksi</th>
            </tr>
          </thead>
          <tbody>
            {dataSource && dataSource.length > 0 ? (
              dataSource?.map((data, key) => (
                <tr key={key}>
                  <td>{offset + key + 1}</td>
                  <td>{data.nama_kprk}</td>
                  <td></td>
                  <td>{numFormatter(data.hasil_pelaporan_biaya)}</td>
                  <td>{numFormatter(data.hasil_pelaporan_pendapatan)}</td>
                  <td>{numFormatter(data.hasil_verifikasi_biaya)}</td>
                  <td>{numFormatter(data.hasil_verifikasi_pendapatan)}</td>
                  <td>{numFormatter(data.deviasi_biaya)}</td>
                  <td>{numFormatter(data.deviasi_produksi)}</td>
                  <td>{numFormatter(data.deviasi_akhir)}</td>
                  <td>
                    <Link
                      href={`./kertas-kerja-verifikasi/${data.id_kprk}`}
                      className={cn(
                        buttonVariants({
                          size: "icon",
                          variant: "ghost",
                        })
                      )}
                    >
                      <Eye className="w-4 h-4 mx-auto" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="text-center w-full">
                <td colSpan={11} className="h-24">
                  {isLoading ? "" : "Data tidak ditemukan"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {isLoading && (
          <div className="fixed md:absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          </div>
        )}
      </div>
      <div className="flex lg:flex-row flex-col items-center lg:justify-between py-2 px-2 lg:px-4 rounded-t-md overflow-x-scroll pb-5 mt-2 lg:pb-2">
        <Paginator
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(pageNumber) => {
            setPage(pageNumber);
            fetchData(
              pageNumber,
              tahunSelected,
              triwulanSelected,
              regionalSelected
            );
          }}
          showPreviousNext
          // isLoading={isLoading}
        />
        <div className="pagination-summary text-[9px] lg:text-xs items-center w-full lg:w-auto mt-2 md:mt-0 text-center">
          Menampilkan{" "}
          <span className="font-bold">
            {pagination.startItem}-{pagination.endItem}
          </span>{" "}
          dari <span className="font-bold">{pagination.total_data}</span> item.
        </div>
      </div>
    </div>
  );
};
export default KertasKerjaVerifikasi;
