"use client";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { FC, useEffect, useState } from "react";
import {
  getProvinsi,
  getKabKota,
  getKecamatan,
  getKelurahan,
  postRekonsiliasi,
  getJenisKantor,
  getPenyelenggara,
  putRekonsiliasi,
} from "../../../../../../services";
import { useRouter } from "next/navigation";
import { FormCustomOption } from "../../../../../../store/state";
import Combobox from "@/components/tools/combobox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { KecamatanI } from "@/app/main/referensi/kecamatan/columns";
import { KabKotaI } from "@/app/main/referensi/kabupaten-kota/columns";
import { KelurahanI } from "@/app/main/referensi/kelurahan/columns";
import { IRekonsiliasi, ProvinsiI } from "../../../../../../services/types";
import { context } from "../../../../../../store";
import { stringifyError } from "../../../../../../helper";
// import { penyelenggaraList } from "../data-table";

const FormSchema = z.object({
  id_penyelenggara: z
    .string({ required_error: "Penyelenggara wajib dipilih" })
    .min(1, "Penyelenggara wajib dipilih"),
  id_kantor: z.string().min(1, "ID Kantor wajib diisi"),
  nama_kantor: z.string().min(1, "Nama Kantor wajib diisi"),
  id_jenis_kantor: z.string().min(1, "Jenis Kantor wajib dipilih"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  id_provinsi: z.string().min(1, "Provinsi wajib dipilih"),
  id_kabupaten_kota: z.string().min(1, "Kab/Kota wajib dipilih"),
  id_kecamatan: z.string().min(1, "Kecamatan wajib dipilih"),
  id_kelurahan: z.string().min(1, "Kelurahan wajib dipilih"),
  latitude: z
    .string({ required_error: "Latitude wajib diisi" })
    .regex(
      /^[-+]?\d{1,2}(\.\d+)?$/,
      "Format latitude tidak valid (-90 s.d 90)"
    ),
  longitude: z
    .string({ required_error: "Longitude wajib diisi" })
    .regex(
      /^[-+]?\d{1,3}(\.\d+)?$/,
      "Format longitude tidak valid (-180 s.d 180)"
    ),
});
interface AddI {
  data?: IRekonsiliasi;
  trigger: () => Promise<void>;
}
const Add: FC<AddI> = ({ data, trigger }) => {
  const router = useRouter();
  const ctx = context();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isKcuLoading, setIsKcuLoading] = useState<boolean>(false);
  const [penyelenggaraOptions, setPenyelenggaraOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [jenisKantorOptions, setJenisKantorOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [provinsiOptions, setProvinsiOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [kabKotaOptions, setKabKotaOptions] = useState<Array<FormCustomOption>>(
    []
  );
  const [isKabKotaLoading, setIsKabKotaLoading] = useState<boolean>(false);
  const [kecamatanOptions, setKecamatanOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const [kelurahanOptions, setKelurahanOptions] = useState<
    Array<FormCustomOption>
  >([]);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (dataFormRaw: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    const payload = {
      ...dataFormRaw,
      id_kantor: parseInt(dataFormRaw.id_kantor),
      id_penyelenggara: parseInt(dataFormRaw.id_penyelenggara),
      id_jenis_kantor: parseInt(dataFormRaw.id_jenis_kantor),
      id_provinsi: parseInt(dataFormRaw.id_provinsi),
      id_kabupaten_kota: parseInt(dataFormRaw.id_kabupaten_kota),
      id_kecamatan: parseInt(dataFormRaw.id_kecamatan),
      id_kelurahan: parseInt(dataFormRaw.id_kelurahan),
      latitude: parseFloat(dataFormRaw.latitude),
      longitude: parseFloat(dataFormRaw.longitude),
    };

    try {
      if (!data) {
        await postRekonsiliasi(router, payload as any);
        toast({ title: "Berhasil menambahkan rekonsiliasi!" });
      } else {
        await putRekonsiliasi(router, payload as any, data.id);
        toast({ title: "Berhasil mengubah data!" });
      }
      await trigger();
      ctx.dispatch({ isModal: undefined });
    } catch (err: any) {
      console.log("Err: ", err);
      toast({
        title: err?.response?.data?.message
          ? stringifyError(err?.response?.data?.message)
          : err?.message || "Terdapat kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const firstInit = async () => {
    try {
      const response = await Promise.all([
        getProvinsi(router, `?limit=99`),
        getPenyelenggara(router, `?limit=99`),
        getJenisKantor(router, `?limit=99`),
      ]);
      let provinces: Array<any> = response[0].data.data.map(
        (item: ProvinsiI) => ({
          value: item.id.toString(),
          label: item.nama,
        })
      );
      setProvinsiOptions(provinces);
      let penyelenggaraList: Array<any> = response[1].data.data.map(
        (item: ProvinsiI) => ({
          value: item.id.toString(),
          label: item.nama,
        })
      );
      setPenyelenggaraOptions(penyelenggaraList);
      let jenisKantor_list: Array<any> = response[2].data.data.map(
        (item: ProvinsiI) => ({
          value: item.id.toString(),
          label: item.nama,
        })
      );
      setJenisKantorOptions(jenisKantor_list);

      if (data) {
        form.setValue(
          "id_penyelenggara",
          data.id_penyelenggara?.toString() ?? ""
        );
        form.setValue("alamat", data.alamat ?? "");
        form.setValue("longitude", data.longitude?.toString() ?? "");
        form.setValue("latitude", data.latitude?.toString() ?? "");
        form.setValue("id_kantor", data.id_kantor?.toString() ?? "");
        form.setValue("nama_kantor", data.nama_kantor ?? "");
        form.setValue(
          "id_jenis_kantor",
          data.id_jenis_kantor?.toString() ?? ""
        );
        form.setValue("id_provinsi", data.id_provinsi?.toString() ?? "");
        form.setValue(
          "id_kabupaten_kota",
          data.id_kabupaten_kota?.toString() ?? ""
        );
        form.setValue("id_kecamatan", data.id_kecamatan?.toString() ?? "");
        form.setValue("id_kelurahan", data.id_kelurahan?.toString() ?? "");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
  };
  useEffect(() => {
    firstInit();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, []);

  const getKabKotaByProvinsi = async (id: number | string) => {
    await getKabKota(router, `?id_provinsi=${id}`)
      .then((res) => {
        let kabkotas: Array<any> = res.data.data.map((item: KabKotaI) => ({
          value: item.id.toString(),
          label: item.nama,
        }));
        setKabKotaOptions(kabkotas);
      })
      .catch((err) => {
        toast({
          title: err.message,
          variant: "destructive",
        });
      });
  };
  const getKecamatanByKota = async (id: number | string) => {
    await getKecamatan(router, `?id_kabupaten_kota=${id}`)
      .then((res) => {
        let kecamatans: Array<any> = res.data.data.map((item: KecamatanI) => ({
          value: item.id.toString(),
          label: item.nama,
        }));
        setKecamatanOptions(kecamatans);
      })
      .catch((err) => {
        toast({
          title: err.message,
          variant: "destructive",
        });
      });
  };
  const getKelurahanByKecamatan = async (id: number | string) => {
    await getKelurahan(router, `?id_kecamatan=${id}`)
      .then((res) => {
        let kelurahans: Array<any> = res.data.data.map((item: KelurahanI) => ({
          value: item.id.toString(),
          label: item.nama,
        }));
        setKelurahanOptions(kelurahans);
      })
      .catch((err) => {
        toast({
          title: err.message,
          variant: "destructive",
        });
      });
  };

  // const firstInit = async()=> {
  //     setIsRegionalLoading(true)
  //     await Promise.all([
  //         getRegional(router,'?limit=99'),
  //         getProvinsi(router,'?limit=99'),
  //     ])
  //     .then((responses)=>{
  //         let regionals:Array<any> = responses[0].data.data.map((item:RegionalI) => ({
  //             value: item.id.toString(),
  //             label: item.nama,
  //         }));
  //         setRegionalOptions(regionals)
  //         let provinces:Array<any> = responses[1].data.data.map((item:RegionalI) => ({
  //             value: item.id.toString(),
  //             label: item.nama,
  //         }));
  //         setProvinsiOptions(provinces)
  //         const kpcDetails:IDetailKpc = responses[2].data.data
  //         console.log('kcpDetails: ',kpcDetails);

  //         if (kpcDetails){
  //             getKcuByRegional(kpcDetails.id_regional?.toString())
  //             getAllRegionsByProvince(kpcDetails.id_provinsi)

  //             form.setValue('alamat',kpcDetails.alamat)
  //             form.setValue('id_kabupaten_kota',kpcDetails.id_kabupaten_kota)
  //             form.setValue('id_kprk',kpcDetails.id_kprk.toString())
  //             form.setValue('id_provinsi',kpcDetails.id_provinsi)
  //             form.setValue('id_kecamatan',kpcDetails.id_kecamatan)
  //             form.setValue('id_kelurahan',kpcDetails.id_kelurahan)
  //             form.setValue('id_regional',kpcDetails.id_regional.toString())
  //             // form.setValue('id_user',kpcDetails.id_user)
  //             form.setValue('jenis_kantor',kpcDetails.jenis_kantor)
  //             form.setValue('koordinat_latitude',kpcDetails.koordinat_latitude)
  //             form.setValue('koordinat_longitude',kpcDetails.koordinat_longitude)
  //             form.setValue('nomor_dirian',kpcDetails.nomor_dirian)
  //             form.setValue('nomor_fax',kpcDetails.nomor_fax)
  //             form.setValue('nomor_telpon',kpcDetails.nomor_telpon)
  //         }
  //     })
  //     .catch((err)=> {
  //         console.log('Err: ',err);
  //         toast({
  //             title: err.message,
  //             variant: 'destructive'
  //         })
  //     })
  //     .finally(()=>{
  //         setIsRegionalLoading(false)
  //     })

  // }
  // useEffect(()=>{
  //     if (params.id.length > 0){
  //         console.log('masuk');

  //         firstInit()
  //     }
  // },[])

  return (
    <div className="relative h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          id="form_update_kcp"
          className="py-1 md:py-2 pb-[100px] relative"
        >
          <div className="grid md:grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="id_penyelenggara"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penyelenggara</FormLabel>
                  <Combobox
                    value={field.value}
                    options={penyelenggaraOptions}
                    placeholder={"Pilih Penyelenggara"}
                    onSelect={(value: string) => {
                      form.setValue("id_penyelenggara", value);
                    }}
                    disabled={penyelenggaraOptions.length === 0 || isKcuLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_kantor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Kantor</FormLabel>
                  <Input placeholder="ID Kantor" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nama_kantor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kantor</FormLabel>
                  <Input placeholder="Masukkan Nama Kantor" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_jenis_kantor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kantor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Pilih jenis kantor" />
                    </SelectTrigger>
                    <SelectContent>
                      {jenisKantorOptions &&
                        jenisKantorOptions.length > 0 &&
                        jenisKantorOptions.map((data, key) => (
                          <SelectItem value={`${data.value}`} key={key}>
                            {data.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <Textarea placeholder="Masukkan alamat" {...field} rows={4} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_provinsi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provinsi</FormLabel>
                  <Combobox
                    options={provinsiOptions}
                    placeholder="Pilih Provinsi"
                    value={field.value}
                    onSelect={(val) => {
                      getKabKotaByProvinsi(val);
                      field.onChange(val);
                    }}
                    disabled={provinsiOptions.length === 0}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_kabupaten_kota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kab/Kota</FormLabel>
                  <Combobox
                    options={kabKotaOptions}
                    placeholder="Pilih Kab/Kota"
                    value={field.value}
                    onSelect={(val) => {
                      getKecamatanByKota(val);
                      field.onChange(val);
                    }}
                    disabled={kabKotaOptions.length === 0 || isKabKotaLoading}
                    isLoading={isKabKotaLoading}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_kecamatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kecamatan</FormLabel>
                  <Combobox
                    options={kecamatanOptions}
                    placeholder="Pilih Kecamatan"
                    value={field.value}
                    onSelect={(val) => {
                      getKelurahanByKecamatan(val);
                      field.onChange(val);
                    }}
                    disabled={kecamatanOptions.length === 0}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_kelurahan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelurahan</FormLabel>
                  <Combobox
                    options={kelurahanOptions}
                    placeholder="Pilih Kelurahan"
                    value={`${field.value}`}
                    onSelect={field.onChange}
                    disabled={kelurahanOptions.length === 0}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Koordinat Latitude</FormLabel>
                    <Input placeholder="ex: 40.753" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Koordinat Longitude</FormLabel>
                    <Input placeholder="ex: -73.983" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="sticky bottom-0 left-0 right-0 space-x-2 md:space-x-5 flex justify-end items-center pt-7">
            <Button
              className="text-white"
              onClick={form.handleSubmit(onSubmit)}
              type="submit"
              size="lg"
            >
              {isSubmitting && (
                <ReloadIcon className="mr-2 h-3 w-3 animate-spin" />
              )}
              Simpan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Add;
