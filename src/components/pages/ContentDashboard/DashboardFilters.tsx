"use client";

import { FC, useEffect, useState } from "react";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/tools/combobox";
import { cn } from "@/lib/utils";
import { ChevronsUp } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getProvinsi,
  getKabKota,
  getKecamatan, // pastikan tersedia di services
  getRegional,
  getKPRKByRegional, // KCU by Regional
  getKpcByKcu, // KCP by KCU
} from "../../../../services";

import { RegionalI } from "../../../app/main/referensi/regional/columns";
import { kcuI } from "../../../app/main/referensi/kc-kcu/columns";
import { ProfilKcpI } from "../../../app/main/profilKCP/columns";
import { QueryParams, buildQueryParam } from "../../../../helper";
import { KabKotaI, KecamatanI, ProvinsiI } from "../../../../services/types";

type Option = { value: string; label: string };

export type DashboardFilterValues = {
  id_regional?: string;
  id_kprk?: string; // KCU
  id_kpc?: string; // KCP
  id_provinsi?: string;
  id_kabupaten_kota?: string;
  id_kecamatan?: string;
};

const FormSchema = z.object({
  id_regional: z.string().optional(),
  id_kprk: z.string().optional(),
  id_kpc: z.string().optional(),
  id_provinsi: z.string().optional(),
  id_kabupaten_kota: z.string().optional(),
  id_kecamatan: z.string().optional(),
});

export const DashboardFilters: FC<{
  defaultValues?: Partial<DashboardFilterValues>;
  onApply: (params: string, raw: DashboardFilterValues) => void;
}> = ({ defaultValues, onApply }) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id_regional: "",
      id_kprk: "",
      id_kpc: "",
      id_provinsi: "",
      id_kabupaten_kota: "",
      id_kecamatan: "",
      ...defaultValues,
    },
  });

  const [isFilterHidden, setIsFilterHidden] = useState(false);

  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isRegionalLoading, setIsRegionalLoading] = useState(false);
  const [isKcuLoading, setIsKcuLoading] = useState(false);
  const [isKcpLoading, setIsKcpLoading] = useState(false);
  const [isProvLoading, setIsProvLoading] = useState(false);
  const [isKabLoading, setIsKabLoading] = useState(false);
  const [isKecLoading, setIsKecLoading] = useState(false);

  const [regionalOptions, setRegionalOptions] = useState<Option[]>([]);
  const [kcuOptions, setKcuOptions] = useState<Option[]>([]);
  const [kcpOptions, setKcpOptions] = useState<Option[]>([]);
  const [provinsiOptions, setProvinsiOptions] = useState<Option[]>([]);
  const [kabOptions, setKabOptions] = useState<Option[]>([]);
  const [kecOptions, setKecOptions] = useState<Option[]>([]);

  // init: Provinsi + Regional
  useEffect(() => {
    (async () => {
      setIsInitLoading(true);
      try {
        const [provRes, regRes] = await Promise.all([
          getProvinsi(router, "?limit=999"),
          getRegional(router, "?limit=99"),
        ]);

        const provinces = (provRes.data.data as ProvinsiI[]).map((i) => ({
          value: i.id.toString(),
          label: i.nama,
        }));
        provinces.unshift({ value: "", label: "Semua Provinsi" });

        const regionals = (regRes.data.data as RegionalI[]).map((i) => ({
          value: i.id.toString(),
          label: i.nama,
        }));
        regionals.unshift({ value: "", label: "Semua Regional" });

        setProvinsiOptions(provinces);
        setRegionalOptions(regionals);
      } catch (e) {
        console.error("init filters error:", e);
      } finally {
        setIsInitLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // chain: Regional -> KCU
  const loadKcu = async (regionalId: string) => {
    setIsKcuLoading(true);
    try {
      const res = await getKPRKByRegional(router, regionalId);
      const kcus = (res.data.data as kcuI[]).map((i) => ({
        value: i.id.toString(),
        label: i.nama,
      }));
      kcus.unshift({ value: "", label: "Semua KCU" });
      setKcuOptions(kcus);
    } catch (e) {
      console.error("loadKcu error:", e);
    } finally {
      setTimeout(() => setIsKcuLoading(false), 300);
    }
  };

  // chain: KCU -> KCP
  const loadKcp = async (kcuId: string) => {
    setIsKcpLoading(true);
    try {
      const res = await getKpcByKcu(router, kcuId);
      const kcps = (res.data.data as ProfilKcpI[]).map((i) => ({
        value: i.nomor_dirian.toString(),
        label: i.nama,
      }));
      kcps.unshift({ value: "", label: "Semua KCP" });
      setKcpOptions(kcps);
    } catch (e) {
      console.error("loadKcp error:", e);
    } finally {
      setTimeout(() => setIsKcpLoading(false), 300);
    }
  };

  // chain: Provinsi -> Kab/Kota
  const loadKab = async (provId: string) => {
    setIsKabLoading(true);
    try {
      const res = await getKabKota(router, `?id_provinsi=${provId}`);
      const kabs = (res.data.data as KabKotaI[]).map((i) => ({
        value: i.id.toString(),
        label: i.nama,
      }));
      kabs.unshift({ value: "", label: "Semua Kab/Kota" });
      setKabOptions(kabs);
    } catch (e) {
      console.error("loadKab error:", e);
    } finally {
      setTimeout(() => setIsKabLoading(false), 300);
    }
  };

  // chain: Kab/Kota -> Kecamatan
  const loadKec = async (kabId: string) => {
    setIsKecLoading(true);
    try {
      const res = await getKecamatan(router, `?id_kabupaten_kota=${kabId}`);
      const kecs = (res.data.data as KecamatanI[]).map((i) => ({
        value: i.id.toString(),
        label: i.nama,
      }));
      kecs.unshift({ value: "", label: "Semua Kecamatan" });
      setKecOptions(kecs);
    } catch (e) {
      console.error("loadKec error:", e);
    } finally {
      setTimeout(() => setIsKecLoading(false), 300);
    }
  };
  const buildParams = (v: DashboardFilterValues) => {
    const p: QueryParams = {};
    if (v.id_regional && v.id_regional !== " ") p.id_regional = v.id_regional;
    if (v.id_kprk && v.id_kprk !== " ") p.id_kprk = v.id_kprk;
    if (v.id_kpc && v.id_kpc !== " ") p.id_kpc = v.id_kpc;
    if (v.id_provinsi && v.id_provinsi !== " ") p.id_provinsi = v.id_provinsi;
    if (v.id_kabupaten_kota && v.id_kabupaten_kota !== " ")
      p.id_kabupaten_kota = v.id_kabupaten_kota;
    if (v.id_kecamatan && v.id_kecamatan !== " ")
      p.id_kecamatan = v.id_kecamatan;
    return buildQueryParam(p) || "";
  };

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const params = buildParams(data);
    console.log("[FILTER] raw:", data);
    console.log("[FILTER] params:", params);
    onApply(params, data);
  };

  return (
    <div className="relative">
      <div
        className={cn("rounded-md border bg-card/70 backdrop-blur-sm p-3 mb-4")}
      >
        {/* HEADER: kiri judul, kanan collapse + TERAPKAN */}
        <div className="flex items-center justify-between">
          <div className="font-semibold">Filter</div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterHidden(!isFilterHidden)}
              aria-label="Toggle filter"
            >
              <ChevronsUp className={cn(isFilterHidden && "rotate-180")} />
            </Button>
            {/* Tombol submit dipindah ke pojok kanan */}
            <Button type="submit" form="dashboard-filters-form">
              Terapkan
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form
            id="dashboard-filters-form" // <<==== PENTING: id untuk tombol di header
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "grid lg:grid-cols-3 gap-3 mt-3 transition-all",
              isFilterHidden && "h-0 overflow-hidden pointer-events-none"
            )}
          >
            {/* REGIONAL */}
            <FormField
              control={form.control}
              name="id_regional"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={regionalOptions}
                    placeholder="Pilih Regional"
                    value={field.value}
                    onSelect={(v) => {
                      form.setValue("id_regional", v);
                      form.setValue("id_kprk", "");
                      form.setValue("id_kpc", "");
                      setKcuOptions([]);
                      setKcpOptions([]);
                      if (v) loadKcu(v);
                    }}
                    isLoading={isInitLoading /* || isRegionalLoading */}
                    disabled={regionalOptions.length === 0}
                  />
                </FormItem>
              )}
            />

            {/* KCU */}
            <FormField
              control={form.control}
              name="id_kprk"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={kcuOptions}
                    placeholder="Pilih KCU"
                    value={field.value}
                    onSelect={(v) => {
                      form.setValue("id_kprk", v);
                      form.setValue("id_kpc", "");
                      setKcpOptions([]);
                      if (v) loadKcp(v);
                    }}
                    isLoading={isKcuLoading}
                    disabled={kcuOptions.length === 0}
                  />
                </FormItem>
              )}
            />

            {/* KCP */}
            <FormField
              control={form.control}
              name="id_kpc"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={kcpOptions}
                    placeholder="Pilih KCP"
                    value={field.value}
                    onSelect={(v) => form.setValue("id_kpc", v)}
                    isLoading={isKcpLoading}
                    disabled={kcpOptions.length === 0}
                  />
                </FormItem>
              )}
            />

            {/* PROVINSI */}
            <FormField
              control={form.control}
              name="id_provinsi"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={provinsiOptions}
                    placeholder="Pilih Provinsi"
                    value={field.value}
                    onSelect={(v) => {
                      form.setValue("id_provinsi", v);
                      form.setValue("id_kabupaten_kota", "");
                      form.setValue("id_kecamatan", "");
                      setKabOptions([]);
                      setKecOptions([]);
                      if (v) loadKab(v);
                    }}
                    isLoading={isInitLoading /* || isProvLoading */}
                    disabled={provinsiOptions.length === 0}
                  />
                </FormItem>
              )}
            />

            {/* KAB/KOTA */}
            <FormField
              control={form.control}
              name="id_kabupaten_kota"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={kabOptions}
                    placeholder="Pilih Kab/Kota"
                    value={field.value}
                    onSelect={(v) => {
                      form.setValue("id_kabupaten_kota", v);
                      form.setValue("id_kecamatan", "");
                      setKecOptions([]);
                      if (v) loadKec(v);
                    }}
                    isLoading={isKabLoading}
                    disabled={kabOptions.length === 0}
                  />
                </FormItem>
              )}
            />

            {/* KECAMATAN */}
            <FormField
              control={form.control}
              name="id_kecamatan"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={kecOptions}
                    placeholder="Pilih Kecamatan"
                    value={field.value}
                    onSelect={(v) => form.setValue("id_kecamatan", v)}
                    isLoading={isKecLoading}
                    disabled={kecOptions.length === 0}
                  />
                </FormItem>
              )}
            />

            {/* HAPUS tombol submit di dalam form (yang awalnya ada di bawah grid) */}
          </form>
        </Form>
      </div>
    </div>
  );
};
