/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { NextPage } from "next";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { postUpdatePassword } from "../../../../services";
import { ReloadIcon } from "@radix-ui/react-icons";

const FormSchema = z.object({
    old_password: z.string({required_error: 'Password Lama tidak boleh kosong'}),
    new_password: z.string({required_error: 'Password Baru tidak boleh kosong'}),
    new_password_confirmation: z.string({required_error: 'Konfirmasi Password Baru tidak boleh kosong'})
  }).superRefine(({ new_password_confirmation, new_password }, ctx) => {
      if (new_password_confirmation !== new_password) {
        ctx.addIssue({
          code: "custom",
          message: "Password konfirmasi tidak sama dengan password baru",
          path: ['new_password_confirmation']
        });
    }
  
  })

const GantiPassword:NextPage = ()=>{
    const router = useRouter()
    const [isLoading, setIsLoading] = useState<boolean>(false)



    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    })

    const onSubmit = async (dataForm: z.infer<typeof FormSchema>) =>{
        setIsLoading(true)
        await postUpdatePassword(router, dataForm)
            .then(()=>{
                setTimeout(()=>{
                    form.reset({
                        old_password:'',
                        new_password:'',
                        new_password_confirmation:''
                      }); 
                    toast({
                        title: 'Berhasil ganti password!'
                    })
                },1000)
            })
            .catch((err)=>{
                toast({
                    title: err.response.data.message || err.message,
                    variant: 'destructive'
                })
            })
            .finally(()=>{
                setTimeout(()=>{
                    setIsLoading(false)
                },1000)
            })
    }
   

    return(
        <div className="px-2 md:px-4 py-1 md:py-2">
            
            <h3 className="scroll-m-20 text-xl font-semibold tracking-tight mb-3 border-b pb-2">
                Ganti Password
            </h3>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="space-y-3 ">
                        <FormField
                            control={form.control}
                            name="old_password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password Lama</FormLabel>
                                <FormControl>
                                <Input {...field} autoFocus={false} type="password"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="new_password"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password Baru</FormLabel>
                                <FormControl>
                                <Input {...field} autoFocus={false} type="password"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="new_password_confirmation"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Konfirmasi Password Baru</FormLabel>
                                <FormControl>
                                <Input {...field} autoFocus={false} type="password"/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <Button type="submit">
                        {isLoading && (
                            <ReloadIcon className="mr-2 h-3 w-3 animate-spin"/>
                        )}
                            Ganti Password
                        </Button>
                    </div>
                
                </form>
            </Form>


           
        </div>
    )
}
export default GantiPassword