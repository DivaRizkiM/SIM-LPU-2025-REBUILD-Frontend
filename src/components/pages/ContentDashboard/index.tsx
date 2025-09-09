import { Metadata } from "next"
'use client'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Overview } from "@/components/pages/ContentDashboard/comp/overview"
import { useToast } from "@/components/ui/use-toast"
import GaugeChart from "@/components/Chart/GaugeChart"
import { PieChartComponent } from "@/components/Chart/PieChartFull"
import { PieChartDonut } from "@/components/Chart/PieChartDonut"
import { getRealisasiAnggaran, getRealisasiBiayaChart, getRealisasiBiayaPie, getRealisasiPendapatanDonut, getTargetAnggaranDashboard } from "../../../../services"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BarChartProps, DonutChartProps, GaugeChartProps, PieChartProps } from "@/lib/types"
import Link from "next/link"
import { numFormatter } from "../../../../helper"
import useSWR from "swr"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "dashboard app.",
}

const buttonsSpecial = [
  { 
    label: `Target Anggaran Tahun 2025`, 
    href: '/main/master-data/target-anggaran' 
  },
  { 
    label: 'Target Kantor LPU Tahun 2025', 
    href: '/main/profilKCP' 
  },
]
const buttons = [
  { label: 'Pemetaan', href: '/main/pemetaan/monitoring' },
  { label: 'Profil KPC', href: '/main/profilKCP' },
  { label: 'Verifikasi Biaya', href: '/main/verifikasi-biaya-atribusi' },
  { label: 'Verifikasi Produksi', href: '/main/verifikasi-produksi' },
  { label: 'Verifikasi Pendapatan', href: '/main/verifikasi-biaya-rutin' },
  { label: 'Laporan Realisasi', href: '/main/laporan/kertas-kerja-verifikasi' },
];

export default function DashboardPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Fetcher function
    const fetcher = async (apiCall: (router: any, params: string) => Promise<any>) => {
      try {
        const response = await apiCall(router, "");
        return response.data;
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Something went wrong..",
        });
        throw error;
      }
    };

    // SWR hooks for each API call
    const { data: GaugeData, isLoading:isGaugeDataLoading } = useSWR(["gauge", getRealisasiAnggaran], ([_, apiCall]) => fetcher(apiCall));
    const { data: PieData, isLoading:isPieDataLoading } = useSWR(["pie", getRealisasiBiayaPie], ([_, apiCall]) => fetcher(apiCall));
    const { data: DonutData, isLoading:isDonutDataLoading } = useSWR(["donut", getRealisasiPendapatanDonut], ([_, apiCall]) => fetcher(apiCall));
    const { data: BarData, isLoading:isBarDataLoading } = useSWR(["bar", getRealisasiBiayaChart], ([_, apiCall]) => fetcher(apiCall));
    const { data: TargetAnggaran, isLoading:isTargetAnggaranLoading } = useSWR(["target", getTargetAnggaranDashboard], ([_, apiCall]) => fetcher(apiCall));

    // Loading states
    const isLoading =
      !GaugeData || !PieData || !DonutData || !BarData || !TargetAnggaran;

    // Handle errors (optional)
    // SWR handles caching and revalidation automatically

  return (
    <>
      <div className="flex-col md:flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            {/* <div className="flex items-center space-x-2">
              <CalendarDateRangePicker />
              <Button onClick={()=>{
                toast({
                  title: "Ada kesalahan..",
                  description: 'Lorem ipsum'
                })
              }}>Download</Button>
            </div> */}
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics" disabled>
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value="notifications" disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="relative">
                {isGaugeDataLoading && (
                  <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mt-8"/>
                  </div>
                )}
                  <CardHeader>
                    <CardTitle>Realisasi Anggaran</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2 w-min mx-auto my-auto items-center">
                    {GaugeData && (
                      <GaugeChart data={GaugeData} />
                    )}
                  </CardContent>
                </Card>
                <Card className="relative">
                  {isPieDataLoading && (
                    <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mt-8"/>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>Realisasi Biaya</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2 mx-auto">
                    {PieData && (
                      <PieChartComponent data={PieData}/>
                    )}
                  </CardContent>
                </Card>
                <Card className="relative">
                  {isDonutDataLoading && (
                    <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mt-8"/>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>Realisasi Pendapatan</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mx-auto">
                      {DonutData && (
                        <PieChartDonut data={DonutData}/>
                      )}
                  </CardContent>
                </Card>
              </div>
              <div className="grid">
                <Card className="relative">
                  {isBarDataLoading && (
                    <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/5 dark:bg-black/25 z-10 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mt-8"/>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>Realisasi Subsidi Operasional LPU Tahun 2025</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2 w-[90%] mx-auto">
                    {BarData && (
                      <Overview data={BarData}/>
                    )}
                  </CardContent>
                </Card>
                {/* <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>
                      You made 265 sales this month.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales />
                  </CardContent>
                </Card> */}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                  <Link href={buttonsSpecial[0].href}>
                    <Button className="w-full py-8 relative">
                      {buttonsSpecial[0].label}
                      <br />
                      {isTargetAnggaranLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin"/> 
                      ): (
                        `Rp. ${numFormatter(TargetAnggaran?.data || 0)}`
                      )}
                    </Button>
                  </Link>
                  <Link href={buttonsSpecial[1].href}>
                    <Button className="w-full py-8">
                      {buttonsSpecial[1].label}
                    </Button>
                  </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {buttons.map((button, index) => (
                  <Link key={index} href={button.href}>
                    <Button 
                      className="w-full py-7"
                    >
                      {button.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}