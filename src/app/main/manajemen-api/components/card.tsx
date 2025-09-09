'use client'
import AlertDialog from "@/components/tools/alert-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { IconProps } from "@radix-ui/react-icons/dist/types"
import { Landmark, RefreshCcw } from "lucide-react"
import { FC } from "react"
import { context } from "../../../../../store"

export interface CardProp {
    Icon: React.ReactNode,
    name: string,
    onSync: ()=>Promise<void>
}
const Card:FC<CardProp>= ({Icon,name,onSync})=> {
    const ctx = context()

    const onClickSync = ()=> {
        ctx.dispatch({
            alertDialog: {
                title: `Apakah anda yakin ingin menyinkronkan ${name}?`,
                type: 'sync',
                onSubmit: async()=>{
                    await onSync()
                }
            }
        })
    }   

    return(
        <div className="flex justify-between items-center gap-2 dark:bg-sky-950 bg-sky-200 p-3 rounded-lg">
            <div className="flex items-center gap-3">
                {Icon}
                {name}
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>    
                        <Button 
                            size={'icon'} 
                            variant={"outline"}
                            onClick={onClickSync}
                        >
                            <RefreshCcw/>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Sinkronisasi</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

export default Card