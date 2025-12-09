"use client";

import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Form, FormField, FormItem } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  getKPRKByRegional,
  getKabKota,
  getKpcByKcu,
  getKpcKoordinat,
  getProvinsi,
  getRegional,
  getKecamatan,
} from "../../../../../services";
import {
  KPCKoordinat,
  KabKotaI,
  ProvinsiI,
} from "../../../../../services/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/tools/combobox";
import { FormCustomOption } from "../../../../../store/state";
import { RegionalI } from "../../referensi/regional/columns";
import { kcuI } from "../../referensi/kc-kcu/columns";
import { ProfilKcpI } from "../../profilKCP/columns";
import { QueryParams, buildQueryParam } from "../../../../../helper";
import { ChevronsUp, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { context } from "../../../../../store";
import DistanceSearchModal from "./DistanceSearchModal";

const list_tipe_penyelenggara = [
  { value: "lpu", label: "LPU/LPK (KCP)" },
  { value: "mitra", label: "Mitra LPU" },
  { value: "penyelenggara", label: "Penyelenggara POS Lainnya" },
];

const list_penyelenggara = [
  { value: "1", label: "JNT" },
  { value: "2", label: "Sicepat" },
];

const FormSchema = z.object({
  tipe_penyelenggara: z.string().optional(),
  id_penyelenggara: z.string().optional(),
  id_provinsi: z.string().optional(),
  id_kabupaten_kota: z.string().optional(),
  id_kecamatan: z.string().optional(),
  id_regional: z.string().optional(),
  id_kprk: z.string().optional(),
  id_kpc: z.string().optional(),
});
type TipePenyelenggara = "lpu" | "mitra" | "penyelenggara";

const MapsComp = dynamic(() => import("./maps"), { ssr: false });

const Monitoring: NextPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const router = useRouter();
  const ctx = context();
  const [dataSource, setDataSource] = useState<Array<KPCKoordinat>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isKotaLoading, setIsKotaLoading] = useState<boolean>(false);
  const [isKecLoading, setIsKecLoading] = useState<boolean>(false);
  const [isKcuLoading, setIsKcuLoading] = useState<boolean>(false);
  const [isKcpLoading, setIskcpLoading] = useState<boolean>(false);

  const [provinsiOptions, setProvinsiOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [regionalOptions, setRegionalOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [kabKotaOptions, setKabKotaOptions] = useState<Array<FormCustomOption>>(
    []
  );
  const [kecamatanOptions, setKecamatanOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [penyelenggaraOptions, setPenyelenggaraOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [kcuOptions, setkcuOptions] = useState<Array<FormCustomOption>>([]);
  const [kcpOptions, setKcpOptions] = useState<Array<FormCustomOption>>([]);
  const [selectedTipePenyelenggara, setSelectedTipePenyelenggara] =
    useState<TipePenyelenggara>("lpu");
  const [isFilterHidden, setIsFilterHidden] = useState<boolean>(false);
  const [distanceLineData, setDistanceLineData] = useState<any>(null);

  const filterOptionsMap: Record<TipePenyelenggara, string[]> = {
    lpu: ["provinsi", "kabupaten/kota", "kecamatan", "regional", "kprk", "kpc"],
    mitra: [
      "provinsi",
      "kabupaten/kota",
      "kecamatan",
      "regional",
      "kprk",
      "kpc",
    ],
    penyelenggara: ["penyelenggara", "provinsi", "kabupaten/kota", "kecamatan"],
  };

  useEffect(() => {
    if (selectedTipePenyelenggara === "penyelenggara")
      setPenyelenggaraOptions(list_penyelenggara);
    else setPenyelenggaraOptions([]);
  }, [selectedTipePenyelenggara]);

  const firstInit = async () => {
    setIsLoading(true);
    try {
      const [provRes, kpcKoors, regionalsRes] = await Promise.all([
        getProvinsi(router, "?limit=999"),
        getKpcKoordinat(router, "?limit=5000"),
        getRegional(router, "?limit=99"),
      ]);

      const provinces = (provRes.data.data as ProvinsiI[]).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      provinces.unshift({ value: "", label: "Pilih Semua Provinsi" });

      const regionals = (regionalsRes.data.data as RegionalI[]).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      regionals.unshift({ value: "", label: "Pilih Semua Regional" });

      setProvinsiOptions(provinces);
      setRegionalOptions(regionals);
      setDataSource(kpcKoors.data.data);
      setPenyelenggaraOptions([]);
    } catch (err) {
      console.error("Init error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async (
    tipe_penyelenggara = "",
    id_penyelenggara = "",
    id_provinsi = "",
    id_kabupaten_kota = "",
    id_kecamatan = "",
    id_regional = "",
    id_kprk = "",
    id_kpc = ""
  ) => {
    setIsLoading(true);

    const tempParams: QueryParams = { limit: "5000" };
    if (tipe_penyelenggara && tipe_penyelenggara !== " ")
      tempParams.type_penyelenggara = tipe_penyelenggara;
    if (id_penyelenggara && id_penyelenggara !== " ")
      tempParams.id_penyelenggara = id_penyelenggara;
    if (id_provinsi && id_provinsi !== " ")
      tempParams.id_provinsi = id_provinsi;
    if (id_kabupaten_kota && id_kabupaten_kota !== " ")
      tempParams.id_kabupaten_kota = id_kabupaten_kota;
    if (id_kecamatan && id_kecamatan !== " ")
      tempParams.id_kecamatan = id_kecamatan;
    if (id_regional && id_regional !== " ")
      tempParams.id_regional = id_regional;
    if (id_kprk && id_kprk !== " ") tempParams.id_kprk = id_kprk;
    if (id_kpc && id_kpc !== " ") tempParams.id_kpc = id_kpc;

    const params = buildQueryParam(tempParams) || "";
    try {
      const res = await getKpcKoordinat(router, params);
      setDataSource(res.data.data);
    } catch (err) {
      console.error("Fetch error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    firstInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitFilter = (dataForm: z.infer<typeof FormSchema>) => {
    const {
      tipe_penyelenggara,
      id_penyelenggara,
      id_provinsi,
      id_kabupaten_kota,
      id_kecamatan,
      id_regional,
      id_kprk,
      id_kpc,
    } = dataForm;

    fetchData(
      tipe_penyelenggara,
      id_penyelenggara,
      id_provinsi,
      id_kabupaten_kota,
      id_kecamatan,
      id_regional,
      id_kprk,
      id_kpc
    );
  };

  const getKotaByProvince = async (id: string | number) => {
    setIsKotaLoading(true);
    form.setValue("id_kabupaten_kota", "");
    form.setValue("id_kecamatan", "");
    setKecamatanOptions([]);

    try {
      const response = await getKabKota(router, `?id_provinsi=${id}`);
      const kabKotas = (response.data.data as KabKotaI[]).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      kabKotas.unshift({ value: "", label: "Pilih Semua Kab/Kota" });
      setKabKotaOptions(kabKotas);
    } catch (error) {
      console.error("Err: ", error);
    } finally {
      setTimeout(() => setIsKotaLoading(false), 400);
    }
  };

  const getKecamatanByKabKota = async (id: string | number) => {
    setIsKecLoading(true);
    form.setValue("id_kecamatan", "");
    try {
      const res = await getKecamatan(router, `?id_kabupaten_kota=${id}`);
      const kecs = (res.data.data as any[]).map((item) => ({
        value: String(item.id),
        label: item.nama,
      }));
      kecs.unshift({ value: "", label: "Pilih Semua Kecamatan" });
      setKecamatanOptions(kecs);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsKecLoading(false), 400);
    }
  };

  const getKcuByRegional = async (id: string | number) => {
    setIsKcuLoading(true);
    try {
      const res = await getKPRKByRegional(router, id);
      let kcus = (res.data.data as kcuI[]).map((item) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      kcus.unshift({ value: "", label: "Semua KCU" });
      setkcuOptions(kcus);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsKcuLoading(false), 400);
    }
  };

  const getKpcByKcuHandler = async (id: string) => {
    setIskcpLoading(true);
    try {
      const res = await getKpcByKcu(router, id);
      const KCPFiltered = (res.data.data as ProfilKcpI[]).map((item) => ({
        value: item.nomor_dirian.toString(),
        label: item.nama,
      }));
      KCPFiltered.unshift({ value: "", label: "Pilih Semua KCP" });
      setKcpOptions(KCPFiltered);
      form.setValue("id_kpc", "");
    } catch (error) {
      console.error("Err: ", error);
    } finally {
      setTimeout(() => setIskcpLoading(false), 400);
    }
  };

  return (
    <div className="relative p-4">
      <div
        className={cn(
          "absolute z-10 top-0 left-0 right-0 bg-[#AFD2DF]/70 backdrop-blur-sm",
          isFilterHidden && "h-3"
        )}
      >
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 z-20">
          <Button
            size={"icon"}
            type="button"
            onClick={() => setIsFilterHidden(!isFilterHidden)}
          >
            <ChevronsUp className={isFilterHidden ? "rotate-180" : ""} />
          </Button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitFilter)}
            className={cn(
              "grid lg:grid-cols-3 gap-3 px-3 py-4 overflow-x-scroll",
              isFilterHidden && "h-0 py-1 overflow-hidden pointer-events-none"
            )}
          >
            <FormField
              control={form.control}
              name="tipe_penyelenggara"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value: any) => {
                      form.reset();
                      setTimeout(() => {
                        field.onChange(value);
                        setSelectedTipePenyelenggara(
                          value as TipePenyelenggara
                        );
                      }, 150);
                    }}
                    value={field.value}
                  >
                    <SelectTrigger id="tipe" className="bg-background">
                      <SelectValue placeholder="Pilih Penyelenggara" />
                    </SelectTrigger>
                    <SelectContent>
                      {list_tipe_penyelenggara.map((data, key) => (
                        <SelectItem key={key} value={data.value}>
                          {data.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {filterOptionsMap[selectedTipePenyelenggara].includes(
              "penyelenggara"
            ) && (
              <FormField
                control={form.control}
                name="id_penyelenggara"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="penyelenggara"
                        className="bg-background"
                      >
                        <SelectValue placeholder="Pilih Penyelenggara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={" "}>Semua Penyelenggara</SelectItem>
                        {list_penyelenggara.map((data, key) => (
                          <SelectItem key={key} value={`${data.value}`}>
                            {data.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="id_provinsi"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={provinsiOptions}
                    placeholder="Pilih Provinsi"
                    value={field.value}
                    onSelect={(e) => {
                      form.setValue("id_provinsi", e);
                      getKotaByProvince(e);
                    }}
                    isLoading={isLoading}
                    disabled={provinsiOptions.length === 0}
                  />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="id_kabupaten_kota"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={kabKotaOptions}
                    placeholder="Pilih Kab/Kota"
                    value={field.value}
                    onSelect={(e) => {
                      form.setValue("id_kabupaten_kota", e);
                      getKecamatanByKabKota(e);
                    }}
                    isLoading={isKotaLoading || isLoading}
                    disabled={kabKotaOptions.length === 0 || isLoading}
                  />
                </FormItem>
              )}
            />

            {filterOptionsMap[selectedTipePenyelenggara].includes(
              "kecamatan"
            ) && (
              <FormField
                control={form.control}
                name="id_kecamatan"
                render={({ field }) => (
                  <FormItem>
                    <Combobox
                      options={kecamatanOptions}
                      placeholder="Pilih Kecamatan"
                      value={field.value}
                      onSelect={(e) => form.setValue("id_kecamatan", e)}
                      isLoading={isKecLoading}
                      disabled={kecamatanOptions.length === 0 || isKecLoading}
                    />
                  </FormItem>
                )}
              />
            )}

            {filterOptionsMap[selectedTipePenyelenggara].includes(
              "regional"
            ) && (
              <FormField
                control={form.control}
                name="id_regional"
                render={({ field }) => (
                  <FormItem>
                    <Combobox
                      options={regionalOptions}
                      placeholder="Pilih Regional"
                      value={field.value}
                      isLoading={isLoading}
                      onSelect={(e) => {
                        form.setValue("id_regional", e);
                        getKcuByRegional(e);
                      }}
                      disabled={regionalOptions.length === 0}
                    />
                  </FormItem>
                )}
              />
            )}

            {filterOptionsMap[selectedTipePenyelenggara].includes("kprk") && (
              <FormField
                control={form.control}
                name="id_kprk"
                render={({ field }) => (
                  <FormItem>
                    <Combobox
                      options={kcuOptions}
                      placeholder="Pilih KC/KCU"
                      value={field.value}
                      isLoading={isKcuLoading}
                      onSelect={(e) => {
                        form.setValue("id_kprk", e);
                        getKpcByKcuHandler(e);
                      }}
                      disabled={kcuOptions.length === 0 || isKcuLoading}
                    />
                  </FormItem>
                )}
              />
            )}

            {filterOptionsMap[selectedTipePenyelenggara].includes("kpc") && (
              <FormField
                control={form.control}
                name="id_kpc"
                render={({ field }) => (
                  <FormItem>
                    <Combobox
                      options={kcpOptions}
                      placeholder="Pilih KCP"
                      value={field.value}
                      isLoading={isKcpLoading}
                      onSelect={(e) => form.setValue("id_kpc", e)}
                      disabled={kcpOptions.length === 0 || isKcpLoading}
                    />
                  </FormItem>
                )}
              />
            )}

            <div className="col-span-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  ctx.dispatch({
                    isModal: {
                      type: "modal",
                      component: (
                        <DistanceSearchModal
                          onClose={() => {
                            ctx.dispatch({
                              isModal: undefined,
                            });
                          }}
                          onDistanceFound={(result) => {
                            setDistanceLineData({
                              origin: result.origin,
                              destination: result.destination,
                              distance_km: result.distance_km,
                            });
                          }}
                        />
                      ),
                    },
                  });
                }}
                className="gap-2"
              >
                <Navigation className="w-4 h-4" />
                Cari Jarak
              </Button>
              <Button type="submit">Terapkan</Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="relative z-0">
        <MapsComp
          dataSource={dataSource}
          isLoading={isLoading}
          currentType={selectedTipePenyelenggara}
          distanceLineData={distanceLineData}
          onClearDistance={() => setDistanceLineData(null)}
        />
      </div>
    </div>
  );
};

export default Monitoring;
