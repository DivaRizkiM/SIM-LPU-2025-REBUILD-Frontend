'use client'
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";
import SubMenu from "./submenu";
import { useEffect, useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { context } from "../../../store";

interface CollapsibleCompProps {
    link: {
        title: string
        label?: string
        icon: LucideIcon
        variant: "default" | "ghost"
        url?: string
        child?: {
          title: string
          label?: string
          variant: "default" | "ghost"
          url: string
        }[]
      },
      setLayout: any
      id: number
}

export default function CollapsibleComp({link, setLayout, id}:CollapsibleCompProps){

   const ctx = context()
   const {idCollapseSelected} = ctx.state
    const pathname = usePathname()
    
    useEffect(()=> {
        if (pathname.startsWith(link.url || "#")){
            ctx.dispatch({
                idCollapseSelected: id
            })
        }
        /* eslint-disable react-hooks/exhaustive-deps */
    },[])

    return(
        <Collapsible 
        open={id === idCollapseSelected} 
        onOpenChange={(val)=>{
            ctx.dispatch({
                idCollapseSelected: val? id : 999
            })
        }} 
        >
            <CollapsibleTrigger 
            className={cn(
                buttonVariants({ variant: link.variant }),
                link.variant === "default" &&
                "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                "justify-between hover:no-underline w-full"
            )}>
                <link.icon className="mr-2 h-4 w-4"/>
                {link.title}
                <ChevronDown className={cn(
                    id === idCollapseSelected && 'transition-transform delay-100 -rotate-180 ease',
                    'ms-auto'
                )}/> 
            </CollapsibleTrigger>
            <motion.div
                initial={{ opacity: 0,height:0 }}
                animate={{ x:5,opacity:1,height: id === idCollapseSelected ? 'max-content' : 0}}
                transition={{
                    ease: "linear",
                    duration: 0.15,
                    type: id === idCollapseSelected ? "spring" : 'tween', 
                    stiffness: 60
                }}
                exit={{ opacity: 0, height: 0, transition: { duration: .05,ease:'easeInOut' }}}
                className="h-full overflow-hidden"
            >
                <CollapsibleContent className={`m-0 p-0 mt-1`}>
                    {link.child &&(
                            <SubMenu items={link.child} setLayout={setLayout}/>
                            )}
                </CollapsibleContent>
            </motion.div>

        </Collapsible>
    )
}