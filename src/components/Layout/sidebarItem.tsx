'use client'

import Link from "next/link"
import { BetweenHorizontalStart, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import CollapsibleComp from "./CollapsibleComp"
import { usePathname } from "next/navigation"
import { context } from "../../../store"
import { LinkI } from "@/lib/types"

interface NavProps {
  isCollapsed: boolean
  setIsCollapsed:React.Dispatch<React.SetStateAction<boolean>>
  setLayout?:any
  link: LinkI
  id: number
}

export function Item({ link, isCollapsed, setIsCollapsed,setLayout,id }: NavProps) {
  const pathname = usePathname()
  const ctx = context()
  const {isMobile} = ctx.state
  
  
  const isActive = (url:string)=> {
    return pathname.startsWith(url) 
  }
  const checkVariant= (url:string): "default"|"ghost" => {
    return isActive(url) ? "default" : 'ghost'
  }

  
  return isCollapsed ? (
    <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
            <Link
            href={!link.child ? link.url || "#" : "#"}
            onClick={()=>{
                if (link.child){
                    if (!isCollapsed){
                        const arrValue = [4,96]
                        setLayout(arrValue)
                        document.cookie = `react-resizable-panels:layout=${arrValue}; path=/`
                    }else {
                        const arrValue = !isMobile ? [20, 80] : [100, 0]
                        setLayout(arrValue)
                        document.cookie = `react-resizable-panels:layout=${arrValue}; path=/`
                    }
                    setTimeout(()=>{
                        ctx.dispatch({
                            idCollapseSelected: id
                        })
                    },100)
                    document.cookie =`react-resizable-panels:collapsed=${!isCollapsed}; path=/`
                    return setIsCollapsed(!isCollapsed)
                }
            }}
            className={cn(
                buttonVariants({ variant: checkVariant(link.url || "#"), size: "icon" }),
                "h-9 w-9",
                checkVariant(link.url || "#") === "default" &&
                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
            )}
            >
            <link.icon className="h-4 w-4" />
            {link.child && <BetweenHorizontalStart size={11} className="absolute end-1"/>}
            <span className="sr-only">{link.title}</span>
            </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
            {link.title}
            {link.label && (
            <span className="ml-auto text-muted-foreground">
                {link.label}
            </span>
            )}
        </TooltipContent>
    </Tooltip>
    ) : link.child ? (
        <CollapsibleComp 
        link={link} 
        setLayout={setLayout}
        id={id}
        />
    ): (
        <Link
        href={link.url || "#"}
        onClick={()=>{
            if (!link.child && isMobile){
                setIsCollapsed(false)
                setLayout([4,96])
            }
        }}
        className={cn(
            buttonVariants({ variant: checkVariant(link.url || "#") }),
            checkVariant(link.url || "#") === "default" &&
            "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
            "justify-start"
        )}
    >
        <link.icon className="mr-2 h-4 w-4" />
        {link.title}
        {link.label && (
            <span
            className={cn(
                "ml-auto",
                checkVariant(link.url || "#") === "default" &&
                "text-background dark:text-white"
            )}
            >
            <ChevronDown size={17}/>
            </span>
        )}
    </Link>
            
  )
}