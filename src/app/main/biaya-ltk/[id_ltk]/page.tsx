"use client";
import { NextPage } from "next";
import { getDetailLtk, postVerifikasiLtk } from "../../../../../services";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CurrencyInput, Input } from "@/components/ui/input";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cleanCurrencyFormat,
  formatCurrency,
  stringifyError,
} from "../../../../../helper";
import { toast } from "@/components/ui/use-toast";
import { IFormLtkVerifikasi, LtkI } from "../../../../../services/types";
import { ReloadIcon } from "@radix-ui/react-icons";
import { DownloadCloud, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Detail: NextPage = () => {
  const router = useRouter();
  const params = useParams<{ id_ltk: string }>();
  const [Datasource, setDataSource] = useState<Array<LtkI>>([]);
  const [selectedID, setSelectedID] = useState<string>("");
  const [indexSelected, setIndexSelected] = useState<number>(0);
  const [selectedData, setSelectedData] = useState<LtkI>();
  const [animateTrigger, setAnimateTrigger] = useState<boolean>(false);
  const [dataVerifications, setDataVerifications] = useState<
    Array<IFormLtkVerifikasi>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const firstInit = async () => {
    const payload = `?id_ltk=${params.id_ltk}`;
    setIsLoading(true);
    await getDetailLtk(router, payload)
      .then((res) => {
        const dataResponse: LtkI[] = res.data.data;
        if ((res.data as any).isLock) {
          router.push(`./`);
        }
        setDataSource(dataResponse);
        const dataEarlier: LtkI = dataResponse[0];
        setSelectedID(dataEarlier.id.toString());
        setSelectedData(dataEarlier);

        const tempDataVerifs: IFormLtkVerifikasi[] = dataResponse.map(
          (data) => {
            return {
              id_ltk: data.id.toString(),
              verifikasi_akuntansi: data.verifikasi_akuntansi || "0,00",
              isVerifikasiAkuntansiSesuai:
                cleanCurrencyFormat(data.verifikasi_akuntansi) === "0,00"
                  ? ""
                  : cleanCurrencyFormat(data.verifikasi_akuntansi || "0,00") ===
                    cleanCurrencyFormat(data.mtd_akuntansi || "0,00")
                  ? "1"
                  : "0",
              isVerifikasiProporsiSesuai:
                cleanCurrencyFormat(data.verifikasi_proporsi) === "0,00"
                  ? ""
                  : cleanCurrencyFormat(data.verifikasi_proporsi || "0,00") ===
                    cleanCurrencyFormat(data.proporsi_rumus || "0,00")
                  ? "1"
                  : "0",
              isVerifikasiPsoSesuai:
                cleanCurrencyFormat(data.verifikasi_pso) === "0,00"
                  ? ""
                  : cleanCurrencyFormat(data.verifikasi_pso || "0") ===
                    cleanCurrencyFormat(data.biaya_pso || "0,00")
                  ? "1"
                  : "0",
              verifikasi_pso: data.verifikasi_pso || "0,00",
              verifikasi_proporsi: data.verifikasi_proporsi || "0,00",
              proporsi_rumus_fase_1:
                typeof data.proporsi_rumus_fase_1 === "number"
                  ? data.proporsi_rumus_fase_1
                  : data.proporsi_rumus_fase_1
                  ? String(data.proporsi_rumus_fase_1)
                  : undefined,
              catatan_pemeriksa: data.catatan_pemeriksa || "",
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

  const onClickPagination = (data: LtkI, index: number) => {
    if (data.id.toString() === selectedID) return;
    setSelectedData(data);
    setAnimateTrigger(true);
    setSelectedID(data.id.toString());
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
        [eventName]: value, // biarkan value langsung, agar proporsi_rumus_fase_1 bisa diubah
      };
      setDataVerifications(tempData);
    }
  }

  const selectHandler = (
    val: "0" | "1",
    fieldName: "akuntansi" | "pso" | "proporsi"
  ) => {
    const tempData = [...dataVerifications];

    switch (fieldName) {
      case "akuntansi":
        tempData[indexSelected].verifikasi_akuntansi =
          val === "1"
            ? cleanCurrencyFormat(selectedData?.mtd_akuntansi || "0,00")
            : "0,00";
        tempData[indexSelected].isVerifikasiAkuntansiSesuai = val;
        break;

      case "pso":
        tempData[indexSelected].verifikasi_pso =
          val === "1"
            ? cleanCurrencyFormat(selectedData?.biaya_pso || "0,00")
            : "0,00";
        tempData[indexSelected].isVerifikasiPsoSesuai = val;
        break;

      case "proporsi":
        tempData[indexSelected].verifikasi_proporsi =
          val === "1"
            ? cleanCurrencyFormat(selectedData?.proporsi_rumus || "0,00")
            : "0,00";
        tempData[indexSelected].isVerifikasiProporsiSesuai = val;
        break;

      default:
        break;
    }

    setDataVerifications(tempData);
  };

  const onSubmitVerifikasi = async () => {
    setIsSubmitting(true);
    const tempData: IFormLtkVerifikasi[] = dataVerifications.map((data) => {
      return {
        id_ltk: data.id_ltk,
        verifikasi_akuntansi: data.verifikasi_akuntansi || "0",
        verifikasi_pso: data.verifikasi_pso || "0",
        verifikasi_proporsi:
          data.proporsi_rumus_fase_1 !== undefined &&
          data.proporsi_rumus_fase_1 !== null
            ? String(data.proporsi_rumus_fase_1)
            : "0",
        catatan_pemeriksa: data.catatan_pemeriksa || "",
      };
    });
    const payload = {
      data: tempData,
    };
    await postVerifikasiLtk(router, selectedID, payload)
      .then(() => {
        toast({
          title: "Berhasil submit verifikasi",
        });
        return router.push(`./`);
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
  return (
    <div className="relative px-2 md:px-4 py-1 md:py-2 h-full overflow-hidden">
      {isLoading && (
        <div className="fixed md:absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        </div>
      )}
      <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
        VERIFIKASI LTK - DETAIL
      </h3>
      <div className="flex space-x-2 h-full">
        <ul className="relative space-y-2 text-center w-14  md:w-16 max-h-svh overflow-y-scroll z-20">
          {Datasource.map((data, key) => (
            <li key={key}>
              <Button
                size={"default"}
                variant={
                  data?.id.toString() === selectedID
                    ? "default"
                    : checkVerifSync(
                        dataVerifications[key].verifikasi_akuntansi,
                        cleanCurrencyFormat(data.verifikasi_akuntansi || "0")
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
            "rounded-md border md:px-3 p-2 w-full h-full overflow-y-scroll overflow-x-hidden transition-all duration-200 pb-40 md:pb-2"
          )}
        >
          <h3 className="scroll-m-20 text-lg font-semibold tracking-tight mb-3 text-center pb-2">
            Data Verifikasi
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Kode Rekening</Label>
                <Input
                  value={selectedData?.kode_rekening || ""}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Nama Rekening</Label>
                <Input
                  value={selectedData?.nama_rekening || ""}
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
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>MTD Biaya</Label>
                <Input
                  value={selectedData?.mtd_akuntansi || "0"}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>MTD Biaya Final</Label>
                <Input
                  value={selectedData?.mtd_biaya_hasil || "0"}
                  className="w-full col-span-3 bg-secondary"
                  readOnly
                />
              </div>
              <div className="flex gap-4 items-center mt-4">
                <Label className="font-semibold text-lg">Lampiran: </Label>
                {selectedData &&
                selectedData?.url_file !== "" &&
                selectedData.url_file !== "" ? (
                  <a
                    href={`${selectedData.url_file.replace(/\\/g, "")}`}
                    target="_blank"
                    className={cn("inline", buttonVariants({ size: "sm" }))}
                  >
                    <DownloadCloud className="w-5 h-5 me-1" />
                    {selectedData.nama_file}
                  </a>
                ) : (
                  <span className="text-xs text-red-400">
                    Tidak ditemukan lampiran
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="grid gap-2 md:grid-cols-4 items-center">
                  <Label>MTD Akuntansi</Label>
                  <Input
                    value={selectedData?.mtd_akuntansi}
                    className="w-full col-span-3 bg-secondary"
                    readOnly
                  />
                </div>
                <div className="grid gap-2 md:grid-cols-4 items-center">
                  <div>
                    <Label>
                      Pilih Kondisi <span className="text-red-500">*</span>
                    </Label>
                    {!dataVerifications[indexSelected]
                      ?.isVerifikasiAkuntansiSesuai && (
                      <div className="text-xs text-red-600">Wajib diisi</div>
                    )}
                  </div>
                  <div className="w-full col-span-3">
                    <Select
                      value={
                        dataVerifications[indexSelected]
                          ?.isVerifikasiAkuntansiSesuai
                      }
                      onValueChange={(val: "0" | "1") =>
                        selectHandler(val, "akuntansi")
                      }
                    >
                      <SelectTrigger
                        className={
                          !dataVerifications[indexSelected]
                            ?.isVerifikasiAkuntansiSesuai
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
                    <Label>
                      Nominal Verifikasi <span className="text-red-500">*</span>
                    </Label>
                    {dataVerifications[indexSelected]?.verifikasi_akuntansi ===
                      "" && (
                      <div className="text-xs text-red-600">Wajib diisi</div>
                    )}
                  </div>
                  <CurrencyInput
                    value={
                      dataVerifications[indexSelected]?.verifikasi_akuntansi
                    }
                    name="verifikasi_akuntansi"
                    className={`
    w-full col-span-3 
    ${
      dataVerifications[indexSelected]?.isVerifikasiAkuntansiSesuai === "1"
        ? "bg-secondary"
        : ""
    }
    ${
      dataVerifications[indexSelected]?.verifikasi_akuntansi === ""
        ? "border-red-600"
        : ""
    }
  `}
                    readOnly={
                      dataVerifications[indexSelected]
                        ?.isVerifikasiAkuntansiSesuai === "1"
                    }
                    onChange={handleInput}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid gap-2 md:grid-cols-4 items-center">
                  <Label>Biaya PSO</Label>
                  <Input
                    value={selectedData?.biaya_pso}
                    className="w-full col-span-3 bg-secondary"
                    readOnly
                  />
                </div>
                <div className="grid gap-2 md:grid-cols-4 items-center">
                  <div>
                    <Label>
                      Pilih Kondisi <span className="text-red-500">*</span>
                    </Label>
                    {!dataVerifications[indexSelected]
                      ?.isVerifikasiPsoSesuai && (
                      <div className="text-xs text-red-600">Wajib diisi</div>
                    )}
                  </div>
                  <div className="w-full col-span-3">
                    <Select
                      value={
                        dataVerifications[indexSelected]?.isVerifikasiPsoSesuai
                      }
                      onValueChange={(val: "0" | "1") =>
                        selectHandler(val, "pso")
                      }
                    >
                      <SelectTrigger
                        className={
                          !dataVerifications[indexSelected]
                            ?.isVerifikasiPsoSesuai
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
                    <Label>
                      Nominal Verifikasi <span className="text-red-500">*</span>
                    </Label>
                    {dataVerifications[indexSelected]?.verifikasi_pso ===
                      "" && (
                      <div className="text-xs text-red-600">Wajib diisi</div>
                    )}
                  </div>
                  <CurrencyInput
                    value={dataVerifications[indexSelected]?.verifikasi_pso}
                    name="verifikasi_pso"
                    className={`
                      w-full col-span-3
                      ${
                        dataVerifications[indexSelected]
                          ?.isVerifikasiPsoSesuai === "1"
                          ? "bg-secondary"
                          : ""
                      }
                      ${
                        dataVerifications[indexSelected]?.verifikasi_pso === ""
                          ? "border-red-600"
                          : ""
                      }
                    `}
                    readOnly={
                      dataVerifications[indexSelected]
                        ?.isVerifikasiPsoSesuai === "1"
                    }
                    onChange={handleInput}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid gap-2 md:grid-cols-4 items-center">
                  <Label>Jenis Perhitungan</Label>
                  <Input
                    value={selectedData?.proporsi_rumus}
                    className="w-full col-span-3 bg-secondary"
                    readOnly
                  />
                </div>
                <div className="grid gap-2 md:grid-cols-4 items-center">
                  <div>
                    <Label>Proporsi</Label>
                  </div>
                  <CurrencyInput
                    value={
                      dataVerifications[indexSelected]?.proporsi_rumus_fase_1
                    }
                    name="proporsi_rumus_fase_1"
                    className={`
                      w-full col-span-3 bg-secondary
                    `}
                    readOnly={true}
                    onChange={handleInput}
                    symbol="%"
                  />
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-4 items-center">
                <Label>Catatan Pemeriksa</Label>
                <Textarea
                  name="catatan_pemeriksa"
                  value={
                    dataVerifications[indexSelected]?.catatan_pemeriksa || ""
                  }
                  onChange={handleInput}
                  className="w-full col-span-3"
                />
              </div>
            </div>
          </div>
          {selectedData?.keterangan == "JOIN" && (
            <JointCost selectedData={selectedData} />
          )}
          {selectedData?.keterangan == "FULL" && (
            <FullCost selectedData={selectedData} />
          )}
          {selectedData?.keterangan == "COMMON" && (
            <CommonCost selectedData={selectedData} />
          )}
        </div>
      </div>
      <div className="absolute h-[60px] md:h-[70px] bg-gradient-to-r from-cyan-500/25 to-blue-500/50 w-full bottom-0 right-0 space-x-2 flex justify-end items-center p-3 pe-8 z-10">
        <Link
          href={`./`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Kembali
        </Link>
        <Button className="text-white" onClick={onSubmitVerifikasi}>
          {isSubmitting && <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />}
          Simpan
        </Button>
      </div>
    </div>
  );
};

const JointCost = ({ selectedData }: { selectedData: LtkI | undefined }) => {
  return (
    <div className="space-y-8 pb-32">
      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Keterangan</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
          {selectedData?.keterangan}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Koefisien produksi</Label>
      </div>
      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Perhitungan Fase 1</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex italic">
          {selectedData?.rumus_fase_1}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Hasil Perhitungan Fase 1</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
          {selectedData?.hasil_perhitungan_fase_1 || "0"}
        </div>
      </div>
    </div>
  );
};

const CommonCost = ({ selectedData }: { selectedData: LtkI | undefined }) => {
  return (
    <div className="space-y-8 pb-32">
      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Keterangan</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
          {selectedData?.keterangan}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Koefisien Pendapatan</Label>
      </div>

      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Perhitungan Fase 1</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex italic">
          {selectedData?.rumus_fase_1}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Hasil Perhitungan Fase 1</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
          {selectedData?.hasil_perhitungan_fase_1 || "0"}
        </div>
      </div>
    </div>
  );
};
const FullCost = ({ selectedData }: { selectedData: LtkI | undefined }) => {
  return (
    <div className="space-y-8 pb-32">
      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Keterangan</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
          {selectedData?.keterangan}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Perhitungan Fase 1</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex italic">
          {selectedData?.rumus_fase_1}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-4 items-center">
        <Label>Hasil Perhitungan Fase 1</Label>
        <div className="w-full md:col-span-3 opacity-80 border-dotted decoration-muted-foreground border-l ps-2 md:ps-3 flex">
          {selectedData?.hasil_perhitungan_fase_1 || "0"}
        </div>
      </div>
    </div>
  );
};

export default Detail;
