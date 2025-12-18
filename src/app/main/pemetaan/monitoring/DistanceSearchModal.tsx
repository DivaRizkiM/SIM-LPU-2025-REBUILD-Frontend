"use client";

import { FC, useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getKantorDistance, getKantorAutocomplete } from "../../../../../services";
import { AlertCircle, CheckCircle2, MapPin, Loader, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const FormSchema = z.object({
  origin_id: z.string().optional(),
  origin_name: z.string().optional(),
  destination_id: z.string().optional(),
  destination_name: z.string().optional(),
});

interface KantorOption {
  id: string | number;
  nomor_dirian: string;
  nama: string;
  jenis_kantor: string;
  alamat: string;
}

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
  
  // Autocomplete states
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [originOptions, setOriginOptions] = useState<KantorOption[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<KantorOption[]>([]);
  const [originSearch, setOriginSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [originLoading, setOriginLoading] = useState(false);
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<KantorOption | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<KantorOption | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      origin_id: "",
      origin_name: "",
      destination_id: "",
      destination_name: "",
    },
  });
  
  // Debounce autocomplete search for origin
  useEffect(() => {
    if (!originSearch || originSearch.length < 2) {
      setOriginOptions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setOriginLoading(true);
      try {
        const res = await getKantorAutocomplete(router, originSearch, undefined, undefined, undefined, 10);
        if (res?.data?.data) {
          setOriginOptions(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching origin autocomplete:', err);
      } finally {
        setOriginLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [originSearch, router]);
  
  // Debounce autocomplete search for destination
  useEffect(() => {
    if (!destinationSearch || destinationSearch.length < 2) {
      setDestinationOptions([]);
      return;
    }
    
    const timer = setTimeout(async () => {
      setDestinationLoading(true);
      try {
        const res = await getKantorAutocomplete(router, destinationSearch, undefined, undefined, undefined, 10);
        if (res?.data?.data) {
          setDestinationOptions(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching destination autocomplete:', err);
      } finally {
        setDestinationLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [destinationSearch, router]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setHasSearched(true);

    try {
      // Validasi harus pilih kedua kantor
      if (!selectedOrigin || !selectedDestination) {
        setError("Harap pilih kantor asal dan kantor tujuan dari daftar autocomplete");
        setLoading(false);
        return;
      }

      const res = await getKantorDistance(
        router,
        selectedOrigin.id.toString(),
        undefined,
        undefined,
        selectedDestination.id.toString(),
        undefined,
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
    setSelectedOrigin(null);
    setSelectedDestination(null);
    setOriginSearch("");
    setDestinationSearch("");
    setOriginOptions([]);
    setDestinationOptions([]);
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
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-700 dark:text-slate-300">Nama Kantor</FormLabel>
                      <Popover open={originOpen} onOpenChange={setOriginOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={originOpen}
                              disabled={loading}
                              className={cn(
                                "w-full justify-between bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600",
                                !selectedOrigin && "text-slate-400 dark:text-slate-500"
                              )}
                            >
                              {selectedOrigin ? (
                                <span className="truncate">{selectedOrigin.nama} - {selectedOrigin.jenis_kantor}</span>
                              ) : (
                                "Ketik untuk mencari kantor..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Cari kantor asal..."
                              value={originSearch}
                              onValueChange={setOriginSearch}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {originLoading ? (
                                  <div className="flex items-center justify-center py-6">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    <span className="ml-2">Mencari...</span>
                                  </div>
                                ) : originSearch.length < 2 ? (
                                  "Ketik minimal 2 karakter untuk mencari"
                                ) : (
                                  "Tidak ada data ditemukan"
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {originOptions.map((kantor) => (
                                  <CommandItem
                                    key={kantor.id}
                                    value={kantor.id.toString()}
                                    onSelect={() => {
                                      setSelectedOrigin(kantor);
                                      form.setValue("origin_id", kantor.id.toString());
                                      form.setValue("origin_name", kantor.nama);
                                      setOriginOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedOrigin?.id === kantor.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{kantor.nama}</span>
                                      <span className="text-xs text-slate-500">
                                        {kantor.jenis_kantor} • {kantor.alamat}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-slate-700 dark:text-slate-300">Nama Kantor</FormLabel>
                      <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={destinationOpen}
                              disabled={loading}
                              className={cn(
                                "w-full justify-between bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600",
                                !selectedDestination && "text-slate-400 dark:text-slate-500"
                              )}
                            >
                              {selectedDestination ? (
                                <span className="truncate">{selectedDestination.nama} - {selectedDestination.jenis_kantor}</span>
                              ) : (
                                "Ketik untuk mencari kantor..."
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Cari kantor tujuan..."
                              value={destinationSearch}
                              onValueChange={setDestinationSearch}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {destinationLoading ? (
                                  <div className="flex items-center justify-center py-6">
                                    <Loader className="h-4 w-4 animate-spin" />
                                    <span className="ml-2">Mencari...</span>
                                  </div>
                                ) : destinationSearch.length < 2 ? (
                                  "Ketik minimal 2 karakter untuk mencari"
                                ) : (
                                  "Tidak ada data ditemukan"
                                )}
                              </CommandEmpty>
                              <CommandGroup>
                                {destinationOptions.map((kantor) => (
                                  <CommandItem
                                    key={kantor.id}
                                    value={kantor.id.toString()}
                                    onSelect={() => {
                                      setSelectedDestination(kantor);
                                      form.setValue("destination_id", kantor.id.toString());
                                      form.setValue("destination_name", kantor.nama);
                                      setDestinationOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedDestination?.id === kantor.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">{kantor.nama}</span>
                                      <span className="text-xs text-slate-500">
                                        {kantor.jenis_kantor} • {kantor.alamat}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Info text */}
            <div className="text-sm text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              💡 <strong>Tips:</strong> Ketik minimal 2 karakter untuk memunculkan daftar kantor. Cari berdasarkan nama kantor, nomor dirian, atau alamat.
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
