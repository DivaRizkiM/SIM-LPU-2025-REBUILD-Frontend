"use client";

import Combobox from "@/components/tools/combobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { getRegional, syncMitraLpu } from "../../../../../services";
import { useRouter } from "next/navigation";
import { FormCustomOption } from "../../../../../store/state";
import { RegionalI } from "../../referensi/regional/columns";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { QueryParams, buildQueryParam, stringifyError } from "../../../../../helper";
import { context } from "../../../../../store";

export function DataMitraLpu() {
  const router = useRouter();
  const ctx = context();

  const [regional, setRegional] = useState<string>("");
  const [regionalOptions, setRegionalOptions] = useState<Array<FormCustomOption>>([]);
  const [isRegionalLoading, setIsRegionalLoading] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const firstInit = async () => {
    setIsRegionalLoading(true);
    try {
      const res = await getRegional(router, "?limit=99");
      const regionals = res.data.data.map((item: RegionalI) => ({
        value: item.id.toString(),
        label: item.nama,
      }));
      setRegionalOptions(regionals);
    } catch (err) {
      console.log("Err:", err);
    } finally {
      setIsRegionalLoading(false);
    }
  };

  useEffect(() => {
    firstInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSync = async () => {
    setIsLoading(true);
    try {
      let tempParams: QueryParams = {};
      tempParams.id_regional = regional;
      const params = buildQueryParam(tempParams) || "";

      const res = await syncMitraLpu(router, params);
      toast({
        title: res.data?.message || "Sinkronisasi Mitra LPU dimulai",
      });
    } catch (error: any) {
      console.log("Err:", error);
      toast({
        title: error.response?.data
          ? stringifyError(error.response?.data.message)
          : error.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const onClickSync = () => {
    ctx.dispatch({
      alertDialog: {
        title: `Apakah anda yakin ingin menyinkronkan Mitra LPU?`,
        type: "sync",
        onSubmit: async () => {
          await onSync();
        },
      },
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-sky-300 dark:bg-sky-950 mb-5">
        <CardTitle>Mitra LPU</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="regional">Regional*</Label>
          <Combobox
            options={regionalOptions}
            placeholder="Pilih Regional*"
            value={regional}
            onSelect={(e) => setRegional(e)}
            isLoading={isRegionalLoading}
            disabled={regionalOptions.length === 0}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant={"secondary"} onClick={onClickSync} disabled={!regional}>
          <RefreshCcw className={cn(`mr-2 w-4 h-4`, isLoading && "animate-spin")} />
          Sinkronisasi
        </Button>
      </CardFooter>
    </Card>
  );
}
