"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getKantorDistance } from "../../../../../services";
import { AlertCircle, CheckCircle2, MapPin, Loader } from "lucide-react";

const FormSchema = z.object({
  origin_name: z.string().optional(),
  destination_name: z.string().optional(),
});

interface DistanceResult {
  origin: {
    id: string | number;
    nama_kantor: string;
    jenis_kantor: string;
    alamat: string;
    longitude: number;
    latitude: number;
  };
  destination: {
    id: string | number;
    nama_kantor: string;
    jenis_kantor: string;
    alamat: string;
    longitude: number;
    latitude: number;
  };
  distance_km: number;
  path_coords?: Array<{ lat: number; lng: number }>;
  geojson?: any;
}

const Row = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex justify-between py-2 border-b border-slate-200">
    <span className="font-medium text-slate-700">{label}</span>
    <span className="text-slate-900 font-semibold">{value ?? "-"}</span>
  </div>
);

interface DistanceSearchModalI {
  onClose?: () => void;
  onDistanceFound?: (result: DistanceResult) => void;
}

const DistanceSearchModal: FC<DistanceSearchModalI> = ({ onClose, onDistanceFound }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DistanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      origin_name: "",
      destination_name: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      // Validasi minimal harus ada salah satu input
      const originFilled =
        (data.origin_name && data.origin_name.trim());
      const destinationFilled =
        (data.destination_name && data.destination_name.trim());

      if (!originFilled || !destinationFilled) {
        setError("Harap isi nama kantor asal dan kantor tujuan");
        setLoading(false);
        return;
      }

      const res = await getKantorDistance(
        router,
        undefined,
        data.origin_name?.trim(),
        undefined,
        undefined,
        data.destination_name?.trim(),
        undefined
      );

      if (res?.data?.data) {
        setResult(res.data.data);
        // Trigger callback untuk menampilkan garis di map
        if (onDistanceFound) {
          onDistanceFound(res.data.data);
        }
        // Auto-close modal langsung tanpa delay
        if (onClose) {
          onClose();
        }
      } else {
        setError((res.data?.message as string) || "Gagal mencari jarak kantor");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat mencari jarak kantor";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setResult(null);
    setError(null);
    setHasSearched(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-6 h-6 text-orange-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Cari Jarak Kantor</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hitung jarak antara dua kantor POS
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && hasSearched && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {!result && !hasSearched ? (
        // Form Input
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Kantor Asal Section */}
            <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-700">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4">Kantor Asal</h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="origin_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Nama Kantor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cth: Kantor Pusat Jakarta"
                          {...field}
                          disabled={loading}
                          className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Kantor Tujuan Section */}
            <div className="p-4 bg-orange-50 dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-slate-700">
              <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-4">Kantor Tujuan</h3>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="destination_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300">Nama Kantor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Cth: KCP Surabaya"
                          {...field}
                          disabled={loading}
                          className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Info text */}
            <div className="text-sm text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              💡 <strong>Tips:</strong> Masukkan nama kantor untuk pencarian. Cari berdasarkan nama kantor, kota, atau regional.
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
                className="dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Mencari..." : "Cari Jarak"}
              </Button>
            </div>
          </form>
        </Form>
      ) : null}
    </div>
  );
};

export default DistanceSearchModal;
