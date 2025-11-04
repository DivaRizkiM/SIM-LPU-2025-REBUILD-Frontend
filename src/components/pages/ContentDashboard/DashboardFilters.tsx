"use client";

import { FC, useEffect, useRef, useState } from "react";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/tools/combobox";
import { cn } from "@/lib/utils";
import { ChevronsUp } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getRegional,
  getKPRKByRegional, // KCU by Regional
  getKpcByKcu, // KCP by KCU
} from "../../../../services";

import { RegionalI } from "../../../app/main/referensi/regional/columns";
import { kcuI } from "../../../app/main/referensi/kc-kcu/columns";
import { ProfilKcpI } from "../../../app/main/profilKCP/columns";
import { QueryParams, buildQueryParam } from "../../../../helper";

type Option = { value: string; label: string };

export type DashboardFilterValues = {
  id_regional?: string;
  id_kprk?: string;
  id_kpc?: string;
  tahun?: string;
  view?: "bulan" | "triwulan";
  bulan?: string;
  triwulan?: string;
};

const FormSchema = z.object({
  id_regional: z.string().optional(),
  id_kprk: z.string().optional(),
  id_kpc: z.string().optional(),
  tahun: z.string().optional(),
  view: z.enum(["bulan", "triwulan"]).optional(),
  bulan: z.string().optional(),
  triwulan: z.string().optional(),
});

export const DashboardFilters: FC<{
  defaultValues?: Partial<DashboardFilterValues>;
  onApply: (params: string, raw: DashboardFilterValues) => void;
}> = ({ defaultValues, onApply }) => {
  const router = useRouter();

  const now = new Date();
  const currentYear = now.getFullYear();
  const defaultBulan = String(now.getMonth() + 1);
  const defaultTriwulan = String(Math.floor(now.getMonth() / 3) + 1);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id_regional: "",
      id_kprk: "",
      id_kpc: "",
      tahun: String(currentYear),
      // default view bulanan, but period empty = "Semua"
      view: "bulan",
      bulan: "",
      triwulan: "",
      ...defaultValues,
    },
  });

  const [isFilterHidden, setIsFilterHidden] = useState(false);

  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isKcuLoading, setIsKcuLoading] = useState(false);
  const [isKcpLoading, setIsKcpLoading] = useState(false);

  const [regionalOptions, setRegionalOptions] = useState<Option[]>([]);
  const [kcuOptions, setKcuOptions] = useState<Option[]>([]);
  const [kcpOptions, setKcpOptions] = useState<Option[]>([]);

  const yearOptions: Option[] = Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  });

  const viewOptions: Option[] = [
    { value: "bulan", label: "Bulanan" },
    { value: "triwulan", label: "Triwulan" },
  ];

  const monthOptions: Option[] = [
    { value: "", label: "Semua Bulan" },
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const triwulanOptions: Option[] = [
    { value: "", label: "Semua Triwulan" },
    { value: "1", label: "Triwulan 1 (Jan-Mar)" },
    { value: "2", label: "Triwulan 2 (Apr-Jun)" },
    { value: "3", label: "Triwulan 3 (Jul-Sep)" },
    { value: "4", label: "Triwulan 4 (Okt-Des)" },
  ];

  useEffect(() => {
    (async () => {
      setIsInitLoading(true);
      try {
        const [regRes] = await Promise.all([getRegional(router, "?limit=99")]);

        const regionals = (regRes.data.data as RegionalI[]).map((i) => ({
          value: i.id.toString(),
          label: i.nama,
        }));
        regionals.unshift({ value: "", label: "Semua Regional" });

        setRegionalOptions(regionals);

        // jika defaultValues punya regional/kcu/kcp, load berantai
        const dv = { ...form.getValues(), ...defaultValues };
        if (dv.id_regional) {
          await loadKcu(dv.id_regional, true);
          if (dv.id_kprk) {
            await loadKcp(dv.id_kprk, true);
          }
        }
      } catch (e) {
        console.error("init filters error:", e);
      } finally {
        setIsInitLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // chain: Regional -> KCU
  const loadKcu = async (regionalId: string, silent = false) => {
    if (!silent) setIsKcuLoading(true);
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
      if (!silent) setTimeout(() => setIsKcuLoading(false), 300);
    }
  };

  // chain: KCU -> KCP
  const loadKcp = async (kcuId: string, silent = false) => {
    if (!silent) setIsKcpLoading(true);
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
      if (!silent) setTimeout(() => setIsKcpLoading(false), 300);
    }
  };

  const buildParams = (v: DashboardFilterValues) => {
    const p: QueryParams = {};
    if (v.id_regional) p.id_regional = v.id_regional;
    if (v.id_kprk) p.id_kprk = v.id_kprk;
    if (v.id_kpc) p.id_kpc = v.id_kpc;
    if (v.tahun) p.tahun = v.tahun;
    if (v.view) p.view = v.view;
    // only include relevant period param
    if (v.view === "bulan" && v.bulan) p.bulan = v.bulan;
    if (v.view === "triwulan" && v.triwulan) p.triwulan = v.triwulan;
    return buildQueryParam(p) || "";
  };

  const watched = useWatch({
    control: form.control,
    name: [
      "id_regional",
      "id_kprk",
      "id_kpc",
      "tahun",
      "view",
      "bulan",
      "triwulan",
    ],
  });
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    // auto-apply saat mount & setiap perubahan 3 field kunci + periode
    const values = form.getValues() as DashboardFilterValues;

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const params = buildParams(values);
      onApply(params, values);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watched?.[0],
    watched?.[1],
    watched?.[2],
    watched?.[3],
    watched?.[4],
    watched?.[5],
    watched?.[6],
  ]);
  // ==========================================================================

  return (
    <div className="relative">
      <div
        className={cn("rounded-md border bg-card/70 backdrop-blur-sm p-3 mb-4")}
      >
        {/* HEADER */}
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
          </div>
        </div>

        <Form {...form}>
          <form
            id="dashboard-filters-form"
            onSubmit={(e) => e.preventDefault()}
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
                    onSelect={async (v) => {
                      form.setValue("id_regional", v);
                      form.setValue("id_kprk", "");
                      form.setValue("id_kpc", "");
                      setKcuOptions([]);
                      setKcpOptions([]);
                      if (v) await loadKcu(v);
                    }}
                    isLoading={isInitLoading}
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
                    onSelect={async (v) => {
                      form.setValue("id_kprk", v);
                      form.setValue("id_kpc", "");
                      setKcpOptions([]);
                      if (v) await loadKcp(v);
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

            {/* TAHUN */}
            <FormField
              control={form.control}
              name="tahun"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={yearOptions}
                    placeholder="Pilih Tahun"
                    value={field.value}
                    onSelect={(v) => form.setValue("tahun", v)}
                  />
                </FormItem>
              )}
            />

            {/* TIPE TAMPILAN */}
            <FormField
              control={form.control}
              name="view"
              render={({ field }) => (
                <FormItem>
                  <Combobox
                    options={viewOptions}
                    placeholder="Tipe Tampilan"
                    value={field.value}
                    onSelect={(v) => {
                      // default view tetap bulanan, tapi periode tetap kosong ("Semua")
                      form.setValue("view", v as "bulan" | "triwulan");
                      // reset period yang tidak relevan, jangan auto-set specific month/triwulan
                      if (v === "bulan") {
                        form.setValue("triwulan", "");
                        // keep bulan as "" => "Semua Bulan" unless user choose
                      } else {
                        form.setValue("bulan", "");
                        // keep triwulan as "" => "Semua Triwulan" unless user choose
                      }
                    }}
                  />
                </FormItem>
              )}
            />

            {/* BULAN - hanya tampil kalau view === 'bulan' */}
            {form.getValues("view") === "bulan" && (
              <FormField
                control={form.control}
                name="bulan"
                render={({ field }) => (
                  <FormItem>
                    <Combobox
                      options={monthOptions}
                      placeholder="Pilih Bulan"
                      value={field.value}
                      onSelect={(v) => form.setValue("bulan", v)}
                    />
                  </FormItem>
                )}
              />
            )}

            {/* TRIWULAN - hanya tampil kalau view === 'triwulan' */}
            {form.getValues("view") === "triwulan" && (
              <FormField
                control={form.control}
                name="triwulan"
                render={({ field }) => (
                  <FormItem>
                    <Combobox
                      options={triwulanOptions}
                      placeholder="Pilih Triwulan"
                      value={field.value}
                      onSelect={(v) => form.setValue("triwulan", v)}
                    />
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
      </div>
    </div>
  );
};
