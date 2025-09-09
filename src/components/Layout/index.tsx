'use client'
import { LayoutDashboard, Map, Database, Warehouse, Receipt, ReceiptText, PackageCheck, BookOpenCheck, HardDriveDownload, FileClock, BookMarked, PersonStanding, KeySquareIcon, FileLock, BookUser, Factory } from "lucide-react";
import { Nav } from "./Sidebar";
import { Separator } from "@/components/ui/separator";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import TopBar from "./Topbar";
import { Suspense, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ImperativePanelHandle } from "react-resizable-panels";
import LoadingComponent from "../tools/loading";
import { motion } from 'framer-motion'
import { context } from "../../../store";
import { ModuleName } from "../../../store/state";


interface DashboardProps {
    accounts?: {
        label: string
        email: string
        icon: React.ReactNode
    }[]
    defaultLayout?: number[] | undefined
    defaultCollapsed: boolean
    navCollapsedSize?: number
    children: React.ReactNode;
}

const Dashboard = ({
    // accounts,
    defaultLayout = [20, 80],
    defaultCollapsed = false,
    navCollapsedSize,
    children
}: DashboardProps) => {
    const ctx = context()
    const { isMobile } = ctx.state
    const containerRef = useRef<HTMLDivElement>(null)
    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed)
    const [layout, setLayout] = useState(isMobile ? [4, 96] : defaultLayout)

    useEffect(() => {
        setLayout(isMobile ? [4, 96] : defaultLayout)
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [isMobile])

    const resizeRef = useRef<ImperativePanelHandle>(null);

    useEffect(() => {
        return resizeRef.current?.resize(layout[0]);
    }, [layout])

    useEffect(() => {
        if (containerRef.current && containerRef.current.offsetWidth <= 991) {
            ctx.dispatch({
                isMobile: true
            })
        }
        else {
            ctx.dispatch({
                isMobile: false
            })
        }
        /* eslint-disable react-hooks/exhaustive-deps */
    }, [containerRef])

    return (
        <div ref={containerRef} className="h-full">
            <TooltipProvider>
                <TopBar />
                <ResizablePanelGroup
                    direction="horizontal"
                    onLayout={(sizes: number[]) => {
                        document.cookie = `react-resizable-panels:layout=${JSON.stringify(
                            sizes
                        )}; path=/`
                    }}
                    className="h-full items-stretch"
                >

                    <ResizablePanel
                        defaultSize={layout[0]}
                        ref={resizeRef}
                        collapsedSize={navCollapsedSize}
                        collapsible={true}
                        minSize={14}
                        maxSize={isMobile ? 100 : 30}
                        style={{
                            overflowY: 'scroll',
                            height: 'calc(100dvh - 2rem - 37px)',
                            zIndex: 10
                        }}
                        onCollapse={() => {
                            setIsCollapsed(true)
                            document.cookie = `react-resizable-panels:collapsed=${true
                                }; path=/`
                        }}
                        onExpand={() => {
                            setIsCollapsed(false)
                            document.cookie = `react-resizable-panels:collapsed=${false
                                }; path=/`
                        }}
                        className={cn(isCollapsed ? "min-w-[50px] transition-all duration-200 ease-in-out" : 'transition-all duration-100 ease-in', 'relative  dark:bg-slate-950 bg-white')}
                    >
                        <Nav
                            isCollapsed={isCollapsed}
                            isTop={true}
                            setIsCollapsed={setIsCollapsed}
                            setLayout={setLayout}
                            links={[
                                {
                                    title: "Dashboard",
                                    label: "",
                                    icon: LayoutDashboard,
                                    variant: "default",
                                    url: '/main/dashboard',
                                    module_name: ModuleName.DASHBOARD
                                },
                            ]}
                        />
                        <Separator />
                        <Nav
                            isCollapsed={isCollapsed}
                            setIsCollapsed={setIsCollapsed}
                            setLayout={setLayout}
                            links={[
                                {
                                    title: "Pemetaan",
                                    label: "2",
                                    icon: Map,
                                    variant: "ghost",
                                    url: '/main/pemetaan',
                                    child: [
                                        {
                                            title: "Monitoring",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/pemetaan/monitoring',
                                            module_name: ModuleName.MONITORING
                                        },
                                        {
                                            title: "Rekonsiliasi",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/pemetaan/rekonsiliasi',
                                            module_name: ModuleName.REKONSILIASI
                                        }
                                    ]
                                },
                                {
                                    title: "Master Data",
                                    label: "1",
                                    icon: Database,
                                    variant: "ghost",
                                    url: '/main/master-data',
                                    module_name: ModuleName.MASTER_DATA,
                                    child: [
                                        {
                                            title: "Target Anggaran",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/master-data/target-anggaran',
                                            module_name: ModuleName.MASTER_DATA
                                        }
                                    ]
                                },
                                {
                                    title: "Profil KCP",
                                    label: "",
                                    icon: Warehouse,
                                    variant: "ghost",
                                    url: '/main/profilKCP',
                                    module_name: ModuleName.PROFIL_KCP
                                },
                                {
                                    title: "Verifikasi Biaya Atribusi",
                                    label: "",
                                    icon: ReceiptText,
                                    variant: "ghost",
                                    url: '/main/verifikasi-biaya-atribusi',
                                    module_name: ModuleName.VERIFIKASI_BIAYA_ATRIBUSI
                                },
                                {
                                    title: "Biaya NPP Nasional",
                                    label: "",
                                    icon: ReceiptText,
                                    variant: "ghost",
                                    url: '/main/biaya-npp-nasional',
                                    module_name: ModuleName.BIAYA_NPP_NASIONAL
                                },
                                {
                                    title: "Biaya LTK",
                                    label: "2",
                                    icon: ReceiptText,
                                    variant: "ghost",
                                    child: [
                                        {
                                            title: "Biaya LTK",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/biaya-ltk',
                                            module_name: ModuleName.BIAYA_LTK
                                        },
                                        {
                                            title: "Biaya Gaji Pegawai",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/biaya-gaji-pegawai',
                                            module_name: ModuleName.BIAYA_GAJI_PEGAWAI
                                        }
                                    ]
                                },
                                // {
                                //     title: "Biaya LTK",
                                //     label: "",
                                //     icon: ReceiptText,
                                //     variant: "ghost",
                                //     url: '/main/biaya-ltk',
                                //     module_name: ModuleName.BIAYA_LTK
                                // },
                                {
                                    title: "Verifikasi Biaya Rutin",
                                    label: "",
                                    icon: Receipt,
                                    variant: "ghost",
                                    url: '/main/verifikasi-biaya-rutin',
                                    module_name: ModuleName.VERIFIKASI_BIAYA_RUTIN
                                },
                                {
                                    title: "Verifikasi Produksi",
                                    label: "",
                                    icon: PackageCheck,
                                    variant: "ghost",
                                    url: '/main/verifikasi-produksi',
                                    module_name: ModuleName.VERIFIKASI_PRODUKSI
                                },
                                {
                                    title: "Laporan",
                                    label: "16",
                                    icon: BookOpenCheck,
                                    variant: "ghost",
                                    child: [
                                        {
                                            title: "Kertas Kerja Verifikasi",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/kertas-kerja-verifikasi',
                                            module_name: ModuleName.LAPORAN_KERTAS_KERJA_VERIFIKASI
                                        },
                                        {
                                            title: "Laporan Verifikasi Pendapatan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/laporan-verifikasi-pendapatan',
                                            module_name: ModuleName.LAPORAN_VERIFIKASI_PENDAPATAN
                                        },
                                        {
                                            title: "Laporan Prognosa Pendapatan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/laporan-prognosa-pendapatan',
                                            module_name: ModuleName.LAPORAN_PROGNOSA_PENDAPATAN
                                        },
                                        {
                                            title: "Laporan Verifikasi Biaya",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/laporan-verifikasi-biaya',
                                            module_name: ModuleName.LAPORAN_VERIFIKASI_BIAYA
                                        },
                                        {
                                            title: "Laporan Prognosa Biaya",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/laporan-prognosa-biaya',
                                            module_name: ModuleName.LAPORAN_PROGNOSA_BIAYA
                                        },
                                        {
                                            title: "Realisasi Dana LPU",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/realisasi-dana-lpu',
                                            module_name: ModuleName.LAPORAN_REALISASI_DANA_LPU
                                        },
                                        {
                                            title: "Deviasi Dana LPU",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/deviasi-dana-lpu',
                                            module_name: ModuleName.LAPORAN_DEVIASI_DANA_LPU
                                        },
                                        {
                                            title: "Berita Acara Penarikan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/berita-acara-penarikan',
                                            module_name: ModuleName.LAPORAN_BERITA_ACARA_PENARIKAN
                                        },
                                        {
                                            title: "Berita Acara Verifikasi",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/BA-verifikasi',
                                            module_name: ModuleName.LAPORAN_BERITA_ACARA_VERIFIKASI
                                        },
                                        {
                                            title: "Berita Acara Verifikasi Bulanan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/berita-acara-verifikasi-bulanan',
                                            module_name: ModuleName.LAPORAN_BERITA_ACARA_VERIFIKASI_BULANAN
                                        },
                                        {
                                            title: "Profil BO LPU",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/profil-bo-lpu',
                                            module_name: ModuleName.LAPORAN_PROFIL_BO_LPU
                                        },
                                        {
                                            title: "Cakupan Wilayah",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/cakupan-wilayah',
                                            module_name: ModuleName.LAPORAN_CAKUPAN_WILAYAH
                                        },
                                        {
                                            title: "Monitoring Kantor Existing",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/monitoring-kantor-existing',
                                            module_name: ModuleName.LAPORAN_MONITORING_KANTOR_EXISTING
                                        },
                                        {
                                            title: "Monitoring Kantor Usulan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/monitoring-kantor-usulan',
                                            module_name: ModuleName.LAPORAN_MONITORING_KANTOR_USULAN
                                        },
                                        {
                                            title: "Verifikasi Lapangan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/verifikasi-lapangan',
                                            module_name: ModuleName.LAPORAN_VERIFIKASI_LAPANGAN
                                        },
                                        {
                                            title: "Perbaikan Ringan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/laporan/perbaikan-ringan',
                                            module_name: ModuleName.LAPORAN_PERBAIKAN_RINGAN
                                        },
                                    ]
                                },
                                {
                                    title: "Dashboard Produksi & Pendapatan",
                                    label: "",
                                    icon: Factory,
                                    variant: "ghost",
                                    url: '/main/produksi-pendapatan-dashboard',
                                    module_name: ModuleName.DASHBOARD_PRODUKSI_PENDAPATAN
                                }
                            ]}
                        />
                        <Separator />
                        <Nav
                            isCollapsed={isCollapsed}
                            setIsCollapsed={setIsCollapsed}
                            setLayout={setLayout}
                            links={[
                                {
                                    title: "Manajemen API",
                                    label: "",
                                    icon: HardDriveDownload,
                                    url: '/main/manajemen-api',
                                    variant: "ghost",
                                    module_name: ModuleName.MANAJEMEN_API
                                },
                                {
                                    title: "Sync Log",
                                    label: "",
                                    icon: FileClock,
                                    url: '/main/api-log',
                                    variant: "ghost",
                                    module_name: ModuleName.SYNC_LOG
                                },
                                {
                                    title: "User Log",
                                    label: "",
                                    icon: BookUser,
                                    variant: "ghost",
                                    url: '/main/user-log',
                                    module_name: ModuleName.USER_LOG
                                },
                                {
                                    title: "Referensi",
                                    label: "12",
                                    icon: BookMarked,
                                    variant: "ghost",
                                    url: '/main/referensi',
                                    child: [
                                        {
                                            title: "Rekening Biaya",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/rekening-biaya',
                                            module_name: ModuleName.REFERENSI_REKENING_BIAYA
                                        },
                                        {
                                            title: "Rekening Produksi",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/rekening-produksi',
                                            module_name: ModuleName.REFERENSI_REKENING_PRODUKSI
                                        },
                                        {
                                            title: "Provinsi",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/provinsi',
                                            module_name: ModuleName.REFERENSI_PROVINSI
                                        },
                                        {
                                            title: "Kabupaten/Kota",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/kabupaten-kota',
                                            module_name: ModuleName.REFERENSI_KABUPATEN_KOTA
                                        },
                                        {
                                            title: "Kecamatan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/kecamatan',
                                            module_name: ModuleName.REFERENSI_KECAMATAN
                                        },
                                        {
                                            title: "Kelurahan",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/kelurahan',
                                            module_name: ModuleName.REFERENSI_KELURAHAN
                                        },
                                        {
                                            title: "Nama Penyelenggara",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/nama-penyelenggara',
                                            module_name: ModuleName.REFERENSI_NAMA_PENYELENGGARA
                                        },
                                        {
                                            title: "Jenis Kantor",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/jenis-kantor',
                                            module_name: ModuleName.REFERENSI_JENIS_KANTOR
                                        },
                                        {
                                            title: "Regional",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/regional',
                                            module_name: ModuleName.REFERENSI_REGIONAL
                                        },
                                        {
                                            title: "KC \ KCU",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/kc-kcu',
                                            module_name: ModuleName.REFERENSI_KC_KCU
                                        },
                                        {
                                            title: "Kategori Biaya",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/kategori-biaya',
                                            module_name: ModuleName.REFERENSI_KATEGORI_BIAYA
                                        },
                                        {
                                            title: "Tipe Bisnis",
                                            label: "",
                                            variant: "ghost",
                                            url: '/main/referensi/tipe-bisnis',
                                            module_name: ModuleName.REFERENSI_TIPE_BISNIS
                                        },
                                    ]
                                },
                                {
                                    title: "Manajemen User",
                                    label: "",
                                    icon: PersonStanding,
                                    variant: "ghost",
                                    url: '/main/manajemen-user',
                                    module_name: ModuleName.MANAJEMEN_USER
                                },
                                {
                                    title: "Ganti Password",
                                    label: "",
                                    icon: KeySquareIcon,
                                    variant: "ghost",
                                    url: '/main/ganti-password',
                                    module_name: ModuleName.GANTI_PASSWORD
                                },
                                {
                                    title: "Manajemen Kunci Verifikasi",
                                    label: "",
                                    icon: FileLock,
                                    variant: "ghost",
                                    url: '/main/manajemen-kunci-verifikasi',
                                    module_name: ModuleName.MANAJEMEN_KUNCI_VERIFIKASI
                                },
                            ]}
                        />
                    </ResizablePanel>
                    <ResizableHandle withHandle className="z-0" />
                    <ResizablePanel
                        style={{
                            overflowY: 'scroll',
                            height: 'calc(100dvh - 2rem - 37px)',
                        }}
                        defaultSize={layout[1]}
                        minSize={isMobile ? 0 : 30}

                    >
                        <Suspense fallback={<LoadingComponent />}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, transition: 'easeInOut' }}
                                className="h-full"
                            >
                                {children}
                            </motion.div>
                        </Suspense>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </TooltipProvider>
        </div>
    )
}

export default Dashboard;