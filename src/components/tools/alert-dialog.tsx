'use client'
import {
    AlertDialog as AlertDialogParent,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
import { FC, useState } from "react"
import { context } from "../../../store"
import { cn } from "@/lib/utils"
import { buttonVariants } from "../ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"


const AlertDialog:FC = ()=> {
    const ctx = context()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const closeHandler = ()=> {
        ctx.dispatch({
            alertDialog: undefined
        })
    }
    const onSubmitHandler = async ()=> {
        setIsLoading(true)
        try {
            await ctx.state.alertDialog?.onSubmit()
        }
        finally {
            setTimeout(()=>{
                setIsLoading(false)
                closeHandler()
            },500)
        }
        
    }
    return (
        <AlertDialogParent open={!!ctx.state.alertDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{ctx.state.alertDialog?.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Dengan menekan tombol 
                        {ctx.state.alertDialog?.type === "sync" && ' "Sinkronisasi" '}
                        {ctx.state.alertDialog?.type === "delete" && ' "Hapus" '}
                        {ctx.state.alertDialog?.type === "lock" && ' Nonaktifkan '}
                        {ctx.state.alertDialog?.type === "unlock" && ' Aktifkan '}
                        {ctx.state.alertDialog?.type === "stop" && ' Stop '}
                        Anda akan melakukan proses 
                        {ctx.state.alertDialog?.type === "sync" && ' sinkronisasi '}
                        {ctx.state.alertDialog?.type === "delete" && ' hapus '}
                        {ctx.state.alertDialog?.type === "lock" && ' nonaktif '}
                        {ctx.state.alertDialog?.type === "unlock" && ' pengaktifan '}
                        {ctx.state.alertDialog?.type === "stop" && ' pemberhentian sync '}
                        data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={closeHandler}>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                        className={cn(
                            buttonVariants({variant: ctx.state.alertDialog?.type === "delete" ? 'destructive': 'default' })
                        )}
                        onClick={onSubmitHandler}
                        >
                            {isLoading && <ReloadIcon className="mr-2 w-3 h-3 animate-spin"/>}
                            {ctx.state.alertDialog?.type === "sync" && "Sinkronisasi"}
                            {ctx.state.alertDialog?.type === "delete" && 'Hapus'}
                            {ctx.state.alertDialog?.type === "lock" && ' Nonaktifkan '}
                            {ctx.state.alertDialog?.type === "unlock" && 'Aktifkan'}
                            {ctx.state.alertDialog?.type === "stop" && 'Stop'}
                        </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogParent>
    )
}

export default AlertDialog
  