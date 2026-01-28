"use client";
import { NextPage } from "next";
import {
  getDetailBiayaRutin,
  postVerifikasiBiayaRutin,
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
import { BiayaRutinDetailI } from "@/lib/types";
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
import { IFormRutinVerifikasi } from "../../../../../services/types";
import { ReloadIcon } from "@radix-ui/react-icons";
import { ArrowDown, DownloadCloud, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { number } from "zod";

const PdfViewerComponent = dynamic(() => import("@/components/PdfReader"), {
  ssr: false,
});

const Detail: NextPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const br_id = searchParams.get("ba_id");
  const tahun = searchParams.get("tahun");
  const bulan = searchParams.get("bulan");
  const kode_rek = searchParams.get("kode_rek");
  const id_kcu = searchParams.get("id_kcu");
  const kcp_id = searchParams.get("kpc_id");
  const isLockParam = searchParams.get("isLock") === "1"; // Ambil status lock dari URL
  const [Datasource, setDataSource] = useState<Array<BiayaRutinDetailI>>([]);
  const [selectedID, setSelectedID] = useState<string>("");
  const [indexSelected, setIndexSelected] = useState<number>(0);
  const [selectedData, setSelectedData] = useState<BiayaRutinDetailI>();
  const [animateTrigger, setAnimateTrigger] = useState<boolean>(false);
  const [dataVerifications, setDataVerifications] = useState<
    Array<IFormRutinVerifikasi>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(isLockParam); // State untuk mode locked
  const containerRef = useRef<HTMLDivElement>(null);

  const isLTK = String(selectedData?.kode_rekening ?? "") === "5000000010";
  const NPP_CODES = new Set([
    "5102060006",
    "5102060008",
    "5102060009",
    "5102060010",
    "5102060011",
  ]);
  const isNPP = NPP_CODES.has(String(selectedData?.kode_rekening ?? ""));

  // Fungsi untuk menentukan jenis biaya berdasarkan kode rekening
  const getJenisBiaya = (
    kodeRekening: string | null
  ): "LTK" | "NPP" | "RUTIN" => {
    if (!kodeRekening) return "RUTIN";

    if (kodeRekening === "5000000010") {
      return "LTK";
    } else if (NPP_CODES.has(kodeRekening)) {
      return "NPP";
    } else {
      return "RUTIN";
    }
  };

  const rows = isLTK
    ? [
        { label: "Keterangan", value: selectedData?.keterangan ?? "0" },
        {
          label: "Hasil Perhitungan Fase 1",
          value: selectedData?.hasil_perhitungan_fase_1 ?? "0",
        },
        {
          label: "Perhitungan Fase 2",
          value: selectedData?.rumus_fase_2 ?? "0",
        },
        {
          label: "Hasil Perhitungan Fase 2",
          value: selectedData?.hasil_perhitungan_fase_2 ?? "0",
        },
        {
          label: "Perhitungan Fase 3",
          value: selectedData?.rumus_fase_3 ?? "0",
        },
        {
          label: "Hasil Perhitungan Fase 3",
          value: selectedData?.hasil_perhitungan_fase_3 ?? "0",
        },
      ]
    : isNPP
    ? [
        { label: "Keterangan", value: selectedData?.keterangan ?? "" },
        { label: "Biaya NPP Nasional", value: selectedData?.npp ?? "0" },
        {
          label: "Nilai Setelah Proporsi",
          value: selectedData?.proporsi ?? "0",
        },
        {
          label: "Biaya NPP Per KCP",
          value: selectedData?.biaya_per_npp ?? "0",
        },
      ]
    : [{ label: "Keterangan", value: selectedData?.keterangan ?? "" }];

  const firstInit = async () => {
    setIsLoading(true);

    // Tentukan jenis biaya berdasarkan kode rekening
    const jenisBiaya = getJenisBiaya(kode_rek);

    const params = `?id_verifikasi_biaya_rutin=${br_id}&bulan=${bulan}&kode_rekening=${kode_rek}&id_kcu=${id_kcu}&id_kpc=${kcp_id}&jenis_biaya=${jenisBiaya}`;

    console.log("Params yang dikirim:", params);
    console.log("Jenis Biaya:", jenisBiaya);

    await getDetailBiayaRutin(router, params)
      .then((res) => {
        const dataResponse: BiayaRutinDetailI[] = res.data.data;
        const lockStatus = (res.data as any).isLock;
        
        console.log("🔒 Lock Status dari Backend:", lockStatus);
        console.log("🔗 isLock dari URL:", isLockParam);
        
        // Set locked status dari backend atau parameter URL
        // Tidak perlu redirect, biarkan user masuk tapi field akan disabled jika locked
        setIsLocked(lockStatus || isLockParam);
        setDataSource(dataResponse);
        const dataEarlier: BiayaRutinDetailI = dataResponse[0];
        setSelectedID(dataEarlier.id_verifikasi_biaya_rutin_detail);
        setSelectedData(dataEarlier);

        const tempDataVerifs: IFormRutinVerifikasi[] = dataResponse.map(
          (data) => {
            const isLTKItem = String(data.kode_rekening ?? "") === "5000000010";
            const isNPPItem = NPP_CODES.has(String(data.kode_rekening ?? ""));
            const autoValue = isLTKItem
              ? !data.verifikasi ||
                data.verifikasi === "0,00" ||
                cleanCurrencyFormat(data.verifikasi) === "0"
                ? data.hasil_perhitungan_fase_3
                : data.verifikasi
              : isNPPItem
              ? !data.verifikasi ||
                data.verifikasi === "0,00" ||
                cleanCurrencyFormat(data.verifikasi) === "0"
                ? data.biaya_per_npp
                : data.verifikasi
              : data.verifikasi;
            return {
              id_verifikasi_biaya_rutin_detail:
                data.id_verifikasi_biaya_rutin_detail,
              verifikasi: cleanCurrencyFormat(autoValue ?? ""),
              catatan_pemeriksa: data.catatan_pemeriksa,
              isVerifikasiSesuai:
                isLTKItem || isNPPItem
                  ? "1"
                  : data.verifikasi === "Rp 0,00"
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
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  useEffect(() => {
    firstInit();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  const onClickPagination = (data: BiayaRutinDetailI, index: number) => {
    if (data.id_verifikasi_biaya_rutin_detail === selectedID) return;
    setSelectedData(data);
    setAnimateTrigger(true);
    setSelectedID(data.id_verifikasi_biaya_rutin_detail);
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

    // Ambil hanya data yang sedang aktif (indexSelected)
    const currentData = Datasource[indexSelected];
    const currentVerification = dataVerifications[indexSelected];

    const kodeRekening = String(currentData?.kode_rekening ?? "");
    const isLTKItem = kodeRekening === "5000000010";
    const isNPPItem = NPP_CODES.has(kodeRekening);

    console.log("Data yang akan dikirim:", {
      index: indexSelected,
      kodeRekening,
      isLTKItem,
      isNPPItem,
      verifikasi: currentVerification.verifikasi,
    });

    let verifikasiValue: string | null = currentVerification.verifikasi;

    // Khusus untuk LTK
    if (isLTKItem) {
      console.log("Masuk kondisi LTK");
      const inputVerifikasi = cleanCurrencyForPayload(
        currentVerification.verifikasi || ""
      );
      const pelaporan = cleanCurrencyForPayload(currentData?.pelaporan || "");
      const hasilFase3 = cleanCurrencyForPayload(
        currentData?.hasil_perhitungan_fase_3 || ""
      );

      console.log("Perbandingan LTK:", {
        inputVerifikasi,
        pelaporan,
        hasilFase3,
        hasil_perhitungan_fase_3_raw: currentData?.hasil_perhitungan_fase_3_raw,
      });

      // Cek pelaporan dulu
      if (inputVerifikasi === pelaporan) {
        console.log("LTK: Sama dengan pelaporan");
        verifikasiValue = null;
      } else if (inputVerifikasi === hasilFase3) {
        console.log("LTK: Sama dengan hasil fase 3");
        verifikasiValue = currentData?.hasil_perhitungan_fase_3_raw
          ? String(currentData.hasil_perhitungan_fase_3_raw)
          : null;
      } else {
        console.log("LTK: Input manual");
        verifikasiValue = inputVerifikasi;
      }
    }
    // Khusus untuk NPP
    else if (isNPPItem) {
      console.log("Masuk kondisi NPP");
      const inputVerifikasi = cleanCurrencyForPayload(
        currentVerification.verifikasi || ""
      );
      const pelaporan = cleanCurrencyForPayload(currentData?.pelaporan || "");
      const biayaPerNPP = cleanCurrencyForPayload(
        currentData?.biaya_per_npp || ""
      );

      console.log("Perbandingan NPP:", {
        inputVerifikasi,
        pelaporan,
        biayaPerNPP,
        biaya_per_npp_raw: currentData?.biaya_per_npp_raw,
      });

      // Cek pelaporan dulu
      if (inputVerifikasi === pelaporan) {
        console.log("NPP: Sama dengan pelaporan");
        verifikasiValue = null;
      } else if (inputVerifikasi === biayaPerNPP) {
        console.log("NPP: Sama dengan biaya per NPP");
        verifikasiValue = currentData?.biaya_per_npp_raw
          ? String(currentData.biaya_per_npp_raw)
          : null;
      } else {
        console.log("NPP: Input manual");
        verifikasiValue = inputVerifikasi;
      }
    }
    // Untuk selain LTK dan NPP
    else {
      console.log("Masuk kondisi SELAIN LTK dan NPP");
      if (currentVerification.isVerifikasiSesuai === "1") {
        verifikasiValue = null;
      } else {
        verifikasiValue = cleanCurrencyForPayload(
          currentVerification.verifikasi || ""
        );
      }
    }

    console.log("Hasil verifikasiValue:", verifikasiValue);

    // Kirim hanya 1 data (yang sedang aktif)
    const tempData: IFormRutinVerifikasi[] = [
      {
        id_verifikasi_biaya_rutin_detail:
          currentVerification.id_verifikasi_biaya_rutin_detail.toString(),
        verifikasi: verifikasiValue,
        catatan_pemeriksa: currentVerification.catatan_pemeriksa,
      },
    ];

    console.log(
      "Payload final yang dikirim:",
      JSON.stringify(tempData, null, 2)
    );

    const payload = {
      data: tempData,
    };

    await postVerifikasiBiayaRutin(router, selectedID, payload)
      .then((res) => {
        toast({
          title: "Berhasil submit verifikasi",
        });

        // Setelah berhasil submit, pindah ke tab berikutnya atau kembali ke list
        if (indexSelected < Datasource.length - 1) {
          // Masih ada tab berikutnya, pindah ke tab berikutnya
          const nextIndex = indexSelected + 1;
          const nextData = Datasource[nextIndex];
          onClickPagination(nextData, nextIndex);

          toast({
            title: "Data tersimpan, lanjut ke data berikutnya",
            variant: "default",
          });
        } else {
          // Sudah tab terakhir, kembali ke list
          return router.push(
            `./pelaporan-verifikasi?br_id=${br_id}&kcu_id=${id_kcu}&kcp_id=${kcp_id}&triwulan=${getQuarter(
              parseInt(bulan || "")
            )}&tahun=${tahun}`
          );
        }
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

  const checkVerifSync = (verifikasi: string | null, pelaporan: string) => {
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
      {isLoading && (
        <div className="fixed md:absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        </div>
      )}
      <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
        VERIFIKASI BIAYA RUTIN - DETAIL {isLocked && <span className="text-red-600">(MODE LIHAT - TERKUNCI)</span>}
      </h3>
      <div className="flex space-x-2 h-full">
        <ul className="relative space-y-2 text-center w-14  md:w-16 max-h-svh overflow-y-scroll z-20">
          {Datasource.map((data, key) => (
            <li key={key}>
              <Button
                size={"default"}
                variant={
                  data.id_verifikasi_biaya_rutin_detail === selectedID
                    ? "default"
                    : checkVerifSync(
                        dataVerifications[key].verifikasi,
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
                <Label>Nama KCP</Label>
                <Input
                  value={selectedData?.nama_kcp}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Kategori Biaya</Label>
                <Input
                  value={selectedData?.kategori_biaya}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
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
              {/* Jika bukan auto verifikasi: tampilkan pilihan kondisi + editable nominal seperti sebelumnya.
                  Jika auto verifikasi (LTK atau NPP): tampilkan nominal verifikasi readOnly (dari backend) tanpa pilihan kondisi. */}
              {!(isLTK || isNPP) ? (
                <>
                  <div className="grid gap-2 md:grid-cols-4 items-center">
                    <div>
                      <Label>Pilih Kondisi*</Label>
                      {!dataVerifications[indexSelected]
                        ?.isVerifikasiSesuai && (
                        <div className="text-xs text-red-600">Wajib diisi</div>
                      )}
                    </div>
                    <div className="w-full col-span-3">
                      <Select
                        value={
                          dataVerifications[indexSelected]?.isVerifikasiSesuai
                        }
                        onValueChange={selectHandler}
                        disabled={isLocked}
                      >
                        <SelectTrigger
                          className={
                            !dataVerifications[indexSelected]
                              ?.isVerifikasiSesuai
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
                        dataVerifications[indexSelected]?.isVerifikasiSesuai ===
                          ""
                      }
                      onChange={handleInput}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2 md:grid-cols-4 items-center">
                    <Label>Nominal Verifikasi</Label>
                    <CurrencyInput
                      // prefer editable value from dataVerifications (initialized earlier),
                      // otherwise fallback to computed value for LTK/NPP or selectedData.verifikasi
                      value={
                        dataVerifications[indexSelected]?.verifikasi ||
                        (isLTK
                          ? cleanCurrencyFormat(
                              (selectedData?.verifikasi ??
                                selectedData?.hasil_perhitungan_fase_3) ||
                                ""
                            )
                          : isNPP
                          ? cleanCurrencyFormat(
                              (selectedData?.verifikasi ??
                                selectedData?.biaya_per_npp) ||
                                ""
                            )
                          : selectedData?.verifikasi || "")
                      }
                      name="verifikasi"
                      className={`w-full col-span-3 ${isLocked ? 'bg-secondary' : ''}`}
                      readOnly={isLocked}
                      onChange={handleInput}
                    />
                  </div>
                </>
              )}

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
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {rows.map((r, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-4 items-center">
                <Label>{r.label}</Label>
                <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
                  {r.value}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex gap-2 items-center">
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
                      {selectedData?.nama_file}
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
                      src={`${selectedData?.url_lampiran}?t=${Date.now()}`} // pakai timestamp biar fresh
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
      <div className="absolute h-[55px] bg-gradient-to-r from-cyan-500/25 to-blue-500/50 w-full bottom-0 right-0 space-x-2 flex justify-end items-center p-3 pe-8 z-10">
        <Link
          href={`./pelaporan-verifikasi?br_id=${br_id}&kcu_id=${id_kcu}&kcp_id=${kcp_id}&triwulan=${getQuarter(
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
