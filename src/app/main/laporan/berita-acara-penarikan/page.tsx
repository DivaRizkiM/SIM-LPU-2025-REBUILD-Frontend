"use client";
import { NextPage } from "next";
import { useState } from "react";
import { postExportBeritaAcaraPenarikan } from "../../../../../services";
import { useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import months from "@/lib/months.json";
import years from "@/lib/years.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import "jspdf-autotable";

const FormSchema = z.object({
  tanggal: z.string({ required_error: "Tanggal penarikan tidak boleh kosong" }),
  no_berita_acara: z.string({
    required_error: "No. berita acara tidak boleh kosong",
  }),
  type_data: z.string({ required_error: "tipe data tidak boleh kosong" }),
  bulan: z.string({ required_error: "bulan tidak boleh kosong" }),
  tahun: z.string({ required_error: "tahun_anggaran tidak boleh kosong" }),
  nama_pihak_pertama: z.string().optional(),
  nama_pihak_kedua: z.string().optional(),
});

const types = [
  { value: "1", label: "Realisasi" },
  { value: "2", label: "Prognosa" },
];

const BeritaAcaraPenarikan: NextPage = () => {
  const router = useRouter();
  const [isExportLoading, setIsExportLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (dataForm: z.infer<typeof FormSchema>) => {
    setIsExportLoading(true);
    try {
      const response = await postExportBeritaAcaraPenarikan(router, dataForm);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "berita-acara-penarikan.pdf");
      document.body.appendChild(link);
      link.click();

      // Bersih-bersih
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error: ", err);
      toast({
        title: err?.message || "Gagal mengunduh PDF",
        variant: "destructive",
      });
    } finally {
      setIsExportLoading(false);
    }
  };

  const convertHtmlToPdf = (html: any) => {
    // Create a hidden div to inject the HTML content
    const mainElement = document.createElement("div");
    mainElement.innerHTML = html;

    // Inject custom CSS for desktop view
    const style = document.createElement("style");
    style.innerHTML = `
        @media screen and (max-width: 768px) {
            /* Override mobile styles with desktop styles */
            body {
            width: 1024px;
            margin: 0 auto;
            }
            /* Add any other styles as needed */
        }
        `;
    mainElement.appendChild(style);

    const doc = new jsPDF("p", "pt", "a4");

    doc.html(mainElement, {
      callback: function (doc) {
        doc.save("Berita Acara Penarikan.pdf");
      },
      html2canvas: {
        scale: 0.75,
      },
      x: 80,
      y: 10,
      width: 570,
      windowWidth: 595, // Set to A4 width in points
    });
  };

  return (
    <div className="px-3 lg:px-7 mt-5">
      <h1 className="text-center my-7 md:my-3 font-bold text-2xl">
        Berita Acara Penarikan
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-x-5 gap-y-2"
        >
          <FormField
            control={form.control}
            name="tanggal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Penarikan</FormLabel>
                <Input
                  type="date"
                  onChange={field.onChange}
                  onSelect={field.onChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="no_berita_acara"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Berita Acara</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bulan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bulan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, key) => (
                      <SelectItem value={month.value} key={key}>
                        {month.label}
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
            name="type_data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipe Data</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((month, key) => (
                      <SelectItem value={month.value} key={key}>
                        {month.label}
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
            name="tahun"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun Anggaran</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((month, key) => (
                      <SelectItem value={month.value} key={key}>
                        {month.label}
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
            name="nama_pihak_pertama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pihak Pertama</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nama_pihak_kedua"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pihak Kedua</FormLabel>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2">
            <Button className="">
              {isExportLoading ? (
                <Loader2 className="w-4 h-4 me-2" />
              ) : (
                <Download className="w-4 h-4 me-2" />
              )}
              Export Data
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
export default BeritaAcaraPenarikan;
