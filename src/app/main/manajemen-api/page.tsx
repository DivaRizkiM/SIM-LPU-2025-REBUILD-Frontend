'use client'
import { Book, ChartBarStacked, ContainerIcon, DiamondPercent, Landmark, Paperclip, PersonStanding, RefreshCcw, School, Store, SwatchBook, Wallet } from "lucide-react";
import { NextPage } from "next";
import Card, { CardProp } from "./components/card";
import { cn } from "@/lib/utils";
import { DataBiaya } from "./components/data_biaya";
import { DataProduksi } from "./components/data_produksi";
import { DataBiayaPrognosa } from "./components/data_biaya_prognosa";
import { DataProduksiPrognosa } from "./components/data_produksi_prognosa";
import { DataBiayaAtribusi } from "./components/data_biaya_atribusi";
import { DataBiayaNasional } from "./components/data_biaya_Nasional";
import { DataProduksiNasional } from "./components/data_produksi_Nasional";
import { syncKCP, syncKCU, syncKategoriBiaya, syncKategoriPendapatan, syncKelurahan, syncLampiranBiaya, syncLayananJasaKeuangan, syncLayananKurir, syncPetugasKCP, syncRegional, syncRekeningBiaya, syncRekeningProduksi, syncTipeBisnis, syncMitraLpu } from "../../../../services";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { DataLampiranBiaya } from "./components/lampiran_biaya";
import { DataDashboardProduksiPendapatan } from "./components/dashboard_produksi_pendapatan";
import { DataLTK } from './components/data_biaya_ltk';
import { DataPendapatan } from './components/data_pendapatan';
import { DataMitraLpu} from "./components/data_mitra";

const dataCards = [
    {
        Icon: <Landmark />,
        name: 'Regional',
        onSync: async (router: any) => {
            await syncRegional(router)
        },
    },
    {
        Icon: <School />,
        name: 'KC / KCU',
        onSync: async (router: any) => {
            await syncKCU(router)
        },
    },
    {
        Icon: <Store />,
        name: 'KCP',
        onSync: async (router: any) => {
            await syncKCP(router)
        },
    },
    {
        Icon: <PersonStanding />,
        name: 'Petugas KCP',
        onSync: async (router: any) => {
            await syncPetugasKCP(router)
        },
    },
    {
        Icon: <Wallet />,
        name: 'Rekening Biaya',
        onSync: async (router: any) => {
            await syncRekeningBiaya(router)
        },
    },
    {
        Icon: <SwatchBook />,
        name: 'Tipe Bisnis',
        onSync: async (router: any) => {
            await syncTipeBisnis(router)
        },
    },
    {
        Icon: <Book />,
        name: 'Rekening Produksi',
        onSync: async (router: any) => {
            await syncRekeningProduksi(router)
        },
    },
    {
        Icon: <SwatchBook />,
        name: 'Kategori Biaya',
        onSync: async (router: any) => {
            await syncKategoriBiaya(router)
        },
    },
    {
        Icon: <ChartBarStacked />,
        name: 'Kategori Pendapatan',
        onSync: async (router: any) => {
            await syncKategoriPendapatan(router)
        },
    },
    {
        Icon: <ContainerIcon />,
        name: 'Layanan Kurir',
        onSync: async (router: any) => {
            await syncLayananKurir(router)
        },
    },
    {
        Icon: <DiamondPercent />,
        name: 'Layanan Jasa Keuangan',
        onSync: async (router: any) => {
            await syncLayananJasaKeuangan(router)
        },
    },
]
function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "flex items-center justify-center [&>div]:w-full",
                className
            )}
            {...props}
        />
    )
}

const ManajemenAPI: NextPage = () => {
    const router = useRouter()

    return (
        <div className="px-2 md:px-4 py-1 md:py-2">
            <h3 className="scroll-m-20 text-md font-semibold tracking-tight mb-3 border-b pb-2">Manajemen API</h3>
            <div id="cards" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataCards.map((data, key) => {
                    return (
                        <Card
                            Icon={data.Icon}
                            name={data.name}
                            key={key}
                            onSync={async () => {
                                await data.onSync(router)
                                    .then((res) => {
                                        toast({
                                            title: `Berhasil sinkronisasi ${data.name}`
                                        })
                                    })
                                    .catch((err) => {
                                        console.log('Err: ', err);
                                        toast({
                                            title: `Gagal sinkronisasi ${data.name}`,
                                            variant: 'destructive'
                                        })
                                    })
                            }}
                        />
                    )
                })}
            </div>
            <div className="items-start justify-center gap-6 rounded-lg block md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 mt-8">
                <div className="col-span-2 grid items-start gap-6 mt-6 md:mt-0 lg:col-span-1">
                    <Container>
                        <DataBiaya />
                    </Container>
                    <Container>
                        <DataBiayaPrognosa />
                    </Container>
                    <Container>
                        <DataLampiranBiaya />
                    </Container>
                    <Container>
                        <DataLTK />
                    </Container>
                    <Container>
                        <DataMitraLpu />
                    </Container>
                </div>
                <div className="col-span-2 grid items-start gap-6 mt-6 md:mt-0 lg:col-span-1">
                    <Container>
                        <DataProduksi />
                    </Container>
                    <Container>
                        <DataPendapatan />
                    </Container>
                    <Container>
                        <DataBiayaAtribusi />
                    </Container>
                    <Container>
                        <DataDashboardProduksiPendapatan />
                    </Container>
                </div>
                <div className="col-span-2 grid items-start gap-6 mt-6 md:mt-0 lg:col-span-1">
                    <Container>
                        <DataProduksiPrognosa />
                    </Container>
                    <Container>
                        <DataBiayaNasional />
                    </Container>
                    <Container>
                        <DataProduksiNasional />
                    </Container>
                </div>
            </div>

        </div>
    )
}

export default ManajemenAPI