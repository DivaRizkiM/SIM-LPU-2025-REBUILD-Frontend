"use client";
import { NextPage } from "next";
import {
  getDetailBiayaAtribusi,
  postVerifikasiBiayaAtribusi,
} from "../../../../../services";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BiayaAtribusiDetailI } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  cleanCurrencyFormat,
  cleanCurrencyForPayload,
  formatCurrency,
  getFileFormat,
  getQuarter,
  isUrlValid,
  smoothScroll,
  stringifyError,
} from "../../../../../helper";
import { toast } from "@/components/ui/use-toast";
import { IFormVerifikasiBiayaAtribusi } from "../../../../../services/types";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ArrowDown, DownloadCloud } from "lucide-react";
import dynamic from "next/dynamic";

const PdfViewerComponent = dynamic(() => import("@/components/PdfReader"), {
  ssr: false,
});

const Detail: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ba_id = searchParams.get("ba_id");
  const tahun = searchParams.get("tahun");
  const bulan = searchParams.get("bulan");
  const kode_rek = searchParams.get("kode_rek");
  const id_kcu = searchParams.get("id_kcu");
  const kcp_id = searchParams.get("kpc_id");
  const isLockParam = searchParams.get("isLock") === "1"; // Ambil status lock dari URL
  const [Datasource, setDataSource] = useState<Array<BiayaAtribusiDetailI>>([]);
  const [selectedID, setSelectedID] = useState<string>("");
  const [indexSelected, setIndexSelected] = useState<number>(0);
  const [selectedData, setSelectedData] = useState<BiayaAtribusiDetailI>();
  const [animateTrigger, setAnimateTrigger] = useState<boolean>(false);
  const [dataVerifications, setDataVerifications] = useState<
    Array<IFormVerifikasiBiayaAtribusi>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(isLockParam); // State untuk mode locked
  const containerRef = useRef<HTMLDivElement>(null);

  const firstInit = async () => {
    const params = `?id_biaya_atribusi=${ba_id}&bulan=${bulan}&kode_rekening=${kode_rek}&id_kcu=${id_kcu}`;

    await getDetailBiayaAtribusi(router, params)
      .then((res) => {
        const dataResponse: BiayaAtribusiDetailI[] = res.data.data;
        const lockStatus = (res.data as any).isLock;
        
        // Jika locked dan TIDAK ada parameter isLock di URL, redirect
        // Tapi jika ada parameter isLock, tetap tampilkan (mode view only)
        if (lockStatus && !isLockParam) {
          return router.push(
            `./pelaporan-verifikasi?ba_id=${ba_id}&kcu_id=${id_kcu}&triwulan=${getQuarter(
              parseInt(bulan || "")
            )}&tahun=${tahun}`
          );
        }
        
        setIsLocked(lockStatus || isLockParam);
        setDataSource(dataResponse);
        const dataEarlier: BiayaAtribusiDetailI = dataResponse[0];
        setSelectedID(dataEarlier.id_biaya_atribusi_detail);
        setSelectedData(dataEarlier);

        const tempDataVerifs: IFormVerifikasiBiayaAtribusi[] = dataResponse.map(
          (data) => {
            return {
              id_biaya_atribusi_detail: data.id_biaya_atribusi_detail,
              verifikasi: cleanCurrencyFormat(data.verifikasi),
              catatan_pemeriksa: data.catatan_pemeriksa,
              isVerifikasiSesuai:
                data.verifikasi === "Rp 0,00"
                  ? ""
                  : data.verifikasi === data.pelaporan
                  ? "1"
                  : "0",
            };
          }
        );
        setDataVerifications(tempDataVerifs);
      })
      .catch((err) => {
        console.log("Err: ", err);
      });
  };
  useEffect(() => {
    firstInit();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  const onClickPagination = (data: BiayaAtribusiDetailI, index: number) => {
    if (data.id_biaya_atribusi_detail === selectedID) return;
    setSelectedData(data);
    setAnimateTrigger(true);
    setSelectedID(data.id_biaya_atribusi_detail);
    setIndexSelected(index);
  };

  useEffect(() => {
    if (animateTrigger) {
      setTimeout(() => {
        setAnimateTrigger(false);
      }, 300);
    }
  }, [animateTrigger]);

  function handleInput(event: ChangeEvent<any>) {
    const eventName = event.target.name;
    const value = event.target.value;
    if (indexSelected >= 0) {
      const tempData = [...dataVerifications];
      tempData[indexSelected] = {
        ...tempData[indexSelected],
        [eventName]: eventName === "verifikasi" ? formatCurrency(value) : value,
      };
      setDataVerifications(tempData);
    }
  }
  const selectHandler = (val: "0" | "1") => {
    const tempData = [...dataVerifications];
    if (val === "1") {
      tempData[indexSelected].verifikasi = cleanCurrencyFormat(
        selectedData?.pelaporan || ""
      );
    } else {
      tempData[indexSelected].verifikasi = "";
    }
    tempData[indexSelected].isVerifikasiSesuai = val;
    setDataVerifications(tempData);
  };

  const onSubmitVerifikasi = async () => {
    setIsSubmitting(true);
    const tempData: IFormVerifikasiBiayaAtribusi[] = dataVerifications.map(
      (data) => {
        // Jika kondisi sesuai, kirim null
        // Jika tidak sesuai, kirim number (bukan string)
        let verifikasiValue: string | null;

        if (data.isVerifikasiSesuai === "1") {
          verifikasiValue = null;
        } else {
          // Clean format dan kirim sebagai number
          verifikasiValue = cleanCurrencyForPayload(data.verifikasi || "");
        }

        console.log("Verifikasi Biaya Atribusi:", {
          isSesuai: data.isVerifikasiSesuai,
          verifikasi: data.verifikasi,
          verifikasiValue,
        });

        return {
          id_biaya_atribusi_detail: data.id_biaya_atribusi_detail.toString(),
          verifikasi: verifikasiValue,
          catatan_pemeriksa: data.catatan_pemeriksa,
        };
      }
    );

    console.log(
      "Payload Verifikasi Biaya Atribusi:",
      JSON.stringify(tempData, null, 2)
    );

    const payload = {
      data: tempData,
    };
    await postVerifikasiBiayaAtribusi(router, selectedID, payload)
      .then((res) => {
        toast({
          title: "Berhasil submit verifikasi",
        });
        return router.push(
          `./pelaporan-verifikasi?ba_id=${ba_id}&kcu_id=${id_kcu}&triwulan=${getQuarter(
            parseInt(bulan || "")
          )}&tahun=${tahun}`
        );
      })
      .catch((err) => {
        console.log("Err: ", err);
        toast({
          title: stringifyError(err.response.data.message),
          variant: "destructive",
        });
      })
      .finally(() => {
        setTimeout(() => {
          setIsSubmitting(false);
        }, 500);
      });
  };

  const checkVerifSync = (verifikasi: string, pelaporan: string) => {
    switch (verifikasi) {
      case "0":
        return "outline";
      case pelaporan:
        return "success";
      default:
        return "warning";
    }
  };

  const onClickLampiranHandler = () => {
    if (getFileFormat(selectedData?.url_lampiran || "") === "pdf") {
      smoothScroll("doc_viewer", 0, containerRef);
    } else {
      const url = selectedData?.url_lampiran.replace(/\\/g, "");
      window.open(url, "_blank");
    }
  };

  return (
    <div className="relative px-2 md:px-4 py-1 md:py-2 h-full overflow-hidden">
      <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
        VERIFIKASI BIAYA ATRIBUSI - DETAIL {isLocked && <span className="text-red-600">(MODE LIHAT - TERKUNCI)</span>}
      </h3>
      <div className="flex space-x-2 h-full">
        <ul className="relative space-y-2 text-center w-14  md:w-16 max-h-svh overflow-y-scroll z-20">
          {Datasource.map((data, key) => (
            <li key={key}>
              <Button
                size={"default"}
                variant={
                  data.id_biaya_atribusi_detail === selectedID
                    ? "default"
                    : checkVerifSync(
                        dataVerifications[key].verifikasi || "",
                        cleanCurrencyFormat(data.pelaporan)
                      )
                }
                onClick={() => onClickPagination(data, key)}
              >
                {key + 1}
              </Button>
            </li>
          ))}
        </ul>
        <div
          className={cn(
            animateTrigger
              ? "translate-x-5 md:translate-x-10 opacity-50"
              : "translate-x-0 opacity-1",
            "rounded-md border md:px-3 p-2 w-full h-full overflow-y-scroll overflow-x-hidden transition-all duration-200"
          )}
          ref={containerRef}
        >
          <h3 className="scroll-m-20 text-lg font-semibold tracking-tight mb-3 text-center pb-2">
            Data Verifikasi
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Kode Rekening</Label>
                <Input
                  value={selectedData?.kode_rekening}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Nama Rekening</Label>
                <Input
                  value={selectedData?.nama_rekening}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Periode</Label>
                <Input
                  value={selectedData?.periode}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Nominal Pelaporan</Label>
                <Input
                  value={selectedData?.pelaporan}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <div>
                  <Label>Pilih Kondisi*</Label>
                  {!dataVerifications[indexSelected]?.isVerifikasiSesuai && (
                    <div className="text-xs text-red-600">Wajib diisi</div>
                  )}
                </div>

                <div className="w-full col-span-3">
                  <Select
                    value={dataVerifications[indexSelected]?.isVerifikasiSesuai}
                    onValueChange={selectHandler}
                    disabled={isLocked}
                  >
                    <SelectTrigger
                      className={
                        !dataVerifications[indexSelected]?.isVerifikasiSesuai
                          ? "border-red-600"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Pilih Kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="1">Sesuai</SelectItem>
                        <SelectItem value="0">Tidak Sesuai</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <div>
                  <Label>Nominal Verifikasi*</Label>
                  {dataVerifications[indexSelected]?.verifikasi === "" && (
                    <div className="text-xs text-red-600">Wajib diisi</div>
                  )}
                </div>
                <CurrencyInput
                  value={dataVerifications[indexSelected]?.verifikasi || ""}
                  name="verifikasi"
                  className={`
                                        w-full col-span-3 
                                        ${
                                          dataVerifications[indexSelected]
                                            ?.isVerifikasiSesuai === "1" ||
                                          dataVerifications[indexSelected]
                                            ?.isVerifikasiSesuai === "" ||
                                          isLocked
                                            ? "bg-secondary"
                                            : ""
                                        } 
                                        ${
                                          dataVerifications[indexSelected]
                                            ?.verifikasi === "" && !isLocked
                                            ? "border-red-600"
                                            : ""
                                        }
                                    `}
                  readOnly={
                    isLocked ||
                    dataVerifications[indexSelected]?.isVerifikasiSesuai ===
                      "1" ||
                    dataVerifications[indexSelected]?.isVerifikasiSesuai === ""
                  }
                  onChange={handleInput}
                />
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Catatan Pemeriksa</Label>
                <Textarea
                  name="catatan_pemeriksa"
                  value={
                    dataVerifications[indexSelected]?.catatan_pemeriksa || ""
                  }
                  onChange={handleInput}
                  className={`w-full col-span-3 ${isLocked ? 'bg-secondary' : ''}`}
                  readOnly={isLocked}
                />
              </div>
            </div>
          </div>
          <Separator className="my-7 md:my-12" />
          <div className="grid lg:grid-cols-2 gap-4 mb-32">
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Keterangan</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.keterangan}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Nama KC / KCU</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.nama_kcu}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Jumlah KCP LPU</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.jumlah_kpc_lpu}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Jumlah KCP LPK</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.jumlah_kpc_lpk}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Rumus Alokasi Biaya Per KCU</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.rumus_alokasi_kcu}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Nominal Alokasi Biaya Per KCU</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.alokasi_kcu}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Rumus Biaya Per KCP</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.rumus_biaya_kcp}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Nominal Biaya Per KCP</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.biaya_kcp}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Rute</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.rute}
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-4 items-center">
              <Label>Bobot Kiriman</Label>
              <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                {selectedData?.bobot_kiriman}
              </div>
            </div>
          </div>
          <div>
            <div className="flex gap-4">
              <Label className="font-semibold text-lg">Lampiran: </Label>
              {isUrlValid(selectedData?.url_lampiran || "") ? (
                <Button size={"sm"} onClick={onClickLampiranHandler}>
                  {getFileFormat(selectedData?.url_lampiran || "") === "pdf" ? (
                    <>
                      <ArrowDown className="w-4 h-4 me-1" />
                      Doc Viewer
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="w-5 h-5 me-1" />
                      {selectedData?.url_lampiran}
                    </>
                  )}
                </Button>
              ) : (
                <span className="text-xs text-red-400">
                  Tidak ditemukan lampiran
                </span>
              )}
            </div>
            <div className="mt-5 pb-24">
              {isUrlValid(selectedData?.url_lampiran || "") &&
                selectedData &&
                getFileFormat(selectedData?.url_lampiran || "") === "pdf" && (
                  <div className="w-full h-[600px] mt-4 border rounded overflow-hidden">
                    <iframe
                      key={selectedData?.url_lampiran}
                      src={selectedData?.url_lampiran}
                      title="PDF Preview"
                      width="100%"
                      height="100%"
                      className="border-none"
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-[45px] lg:h-[55px] bg-gradient-to-r from-cyan-500/25 to-blue-500/50 w-full bottom-0 right-0 space-x-2 flex justify-end items-center p-3 pe-8 z-10">
        <Link
          href={`./pelaporan-verifikasi?ba_id=${ba_id}&kcu_id=${id_kcu}&triwulan=${getQuarter(
            parseInt(bulan || "")
          )}&tahun=${tahun}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Kembali
        </Link>
        {!isLocked && (
          <Button className="text-white" onClick={onSubmitVerifikasi}>
            {isSubmitting && <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />}
            Simpan
          </Button>
        )}
      </div>
    </div>
  );
};

export default Detail;
