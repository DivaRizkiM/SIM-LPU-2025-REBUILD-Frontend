"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import GaugeChart from "@/components/Chart/GaugeChart";
import { PieChartComponent } from "@/components/Chart/PieChartFull";
import { PieChartDonut } from "@/components/Chart/PieChartDonut";
import {
  getRealisasiAnggaran,
  getRealisasiBiayaChart,
  getRealisasiBiayaPie,
  getRealisasiPendapatanDonut,
  getTargetAnggaranDashboard,
  getJumlahLPU,
  getJumlahMitraLPU,
} from "../../../../services";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { numFormatter } from "../../../../helper";
import useSWR from "swr";
import { Loader2 } from "lucide-react";
import { DashboardFilters, DashboardFilterValues } from "./DashboardFilters";
import { Overview } from "./comp/overview";

export default function ContentDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  // state query params hasil filter
  const [params, setParams] = useState<string>(""); // contoh: ?id_provinsi=32&id_kprk=10
  const [rawFilters, setRawFilters] = useState<DashboardFilterValues>({});

  // fetcher menerima apiCall + params
  const fetcher = async (
    apiCall: (router: any, params: string) => Promise<any>,
    params: string
  ) => {
    try {
      const res = await apiCall(router, params || "");
      return res.data;
    } catch (e) {
      toast({ variant: "destructive", title: "Something went wrong.." });
      throw e;
    }
  };

  // SWR key berubah saat params berubah -> data re-fetch
  const { data: GaugeData, isLoading: isGaugeDataLoading } = useSWR(
    ["gauge", params, getRealisasiAnggaran],
    ([, p, api]) => fetcher(api, p)
  );
  const { data: PieData, isLoading: isPieDataLoading } = useSWR(
    ["pie", params, getRealisasiBiayaPie],
    ([, p, api]) => fetcher(api, p)
  );
  const { data: DonutData, isLoading: isDonutDataLoading } = useSWR(
    ["donut", params, getRealisasiPendapatanDonut],
    ([, p, api]) => fetcher(api, p)
  );
  const { data: BarData, isLoading: isBarDataLoading } = useSWR(
    ["bar", params, getRealisasiBiayaChart],
    ([, p, api]) => fetcher(api, p)
  );
  const { data: TargetAnggaran, isLoading: isTargetAnggaranLoading } = useSWR(
    ["target", params, getTargetAnggaranDashboard],
    ([, p, api]) => fetcher(api, p)
  );
  const { data: JumlahLPU, isLoading: isJumlahLPULoading } = useSWR(
    ["jumlahlpu", params, getJumlahLPU],
    ([, p, api]) => fetcher(api, p)
  );
  const { data: JumlahMitraLPU, isLoading: isJumlahMitraLPULoading } = useSWR(
    ["mitralpu", params, getJumlahMitraLPU],
    ([, p, api]) => fetcher(api, p)
  );

  const isLoadingAll =
    !GaugeData ||
    !PieData ||
    !DonutData ||
    !BarData ||
    !TargetAnggaran ||
    !JumlahLPU ||
    !JumlahMitraLPU;

  const handleApplyFilters = (
    newParams: string,
    raw: DashboardFilterValues
  ) => {
    // Pastikan backend services mendukung params yang sama seperti di pemetaan.
    // Kalau perlu tambahkan transform di sini.
    setParams(newParams); // contoh: "?id_provinsi=32&id_regional=5&id_kprk=10"
    setRawFilters(raw);
  };

  // tambahkan ini sebelum render Overview
  const selectedView = rawFilters?.view;
  const selectedValue =
    selectedView === "bulan" ? rawFilters?.bulan : rawFilters?.triwulan;

  // if user filtered by bulan/triwulan, consider it a period-filter — hide Gauge
  const hasPeriodFilter =
    (rawFilters?.view === "bulan" && !!rawFilters?.bulan) ||
    (rawFilters?.view === "triwulan" && !!rawFilters?.triwulan);
  const cardGridCols = hasPeriodFilter ? "lg:grid-cols-2" : "lg:grid-cols-3";
  return (
    <div className="flex-col md:flex">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Filter Bar */}
        <DashboardFilters onApply={handleApplyFilters} />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-4">
              <Card className="relative">
                {isJumlahLPULoading && (
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mt-8" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>Jumlah Kantor LPU</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 w-min mx-auto my-auto items-center">
                  <span className="text-4xl font-bold">
                    {typeof JumlahLPU?.count === "number"
                      ? numFormatter(JumlahLPU.count)
                      : "-"}
                  </span>
                </CardContent>
              </Card>

              <Card className="relative">
                {isJumlahMitraLPULoading && (
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mt-8" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>Jumlah Mitra LPU</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 w-min mx-auto my-auto items-center">
                  <span className="text-4xl font-bold">
                    {typeof JumlahMitraLPU?.count === "number"
                      ? numFormatter(JumlahMitraLPU.count)
                      : "-"}
                  </span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jumlah Pengguna Layanan Kantor LPU</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 w-min mx-auto my-auto items-center">
                  <span className="text-4xl font-bold">-</span>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jumlah Pengguna Layanan Mitra LPU</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 w-min mx-auto my-auto items-center">
                  <span className="text-4xl font-bold">-</span>
                </CardContent>
              </Card>
            </div>

            <div className={`grid gap-4 ${cardGridCols}`}>
              {!hasPeriodFilter && (
                <Card className="relative">
                  {isGaugeDataLoading && (
                    <div className="absolute inset-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mt-8" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>Realisasi Anggaran</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2 w-min mx-auto my-auto items-center">
                    {GaugeData && <GaugeChart data={GaugeData} />}
                  </CardContent>
                </Card>
              )}

              <Card className="relative">
                {isPieDataLoading && (
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mt-8" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>Realisasi Biaya</CardTitle>
                </CardHeader>
                <CardContent className="pl-2 mx-auto">
                  {PieData && <PieChartComponent data={PieData} />}
                </CardContent>
              </Card>

              <Card className="relative">
                {isDonutDataLoading && (
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mt-8" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>Realisasi Pendapatan</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mx-auto">
                  {DonutData && <PieChartDonut data={DonutData} />}
                </CardContent>
              </Card>
            </div>

            <div className="grid">
              <Card className="relative">
                {isBarDataLoading && (
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center rounded-lg">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                )}

                <CardHeader>
                  <CardTitle>
                    Realisasi Subsidi Operasional LPU Tahun 2025
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4">
                  {BarData ? (
                    <div className="w-full h-[350px] overflow-visible">
                      <Overview
                        data={BarData}
                        selectedView={selectedView}
                        selectedValue={selectedValue}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Tidak ada data tersedia
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
