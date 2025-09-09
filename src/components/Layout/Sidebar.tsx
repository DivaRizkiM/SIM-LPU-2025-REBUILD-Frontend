'use client'
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { context } from "../../../store"
import { Item } from "./sidebarItem"
import { LinkI } from "@/lib/types"

interface NavProps {
  isCollapsed: boolean
  isTop?: boolean
  setIsCollapsed:React.Dispatch<React.SetStateAction<boolean>>
  setLayout?:any
  links: LinkI[]
}

export function Nav({ links, isCollapsed, isTop=false,setIsCollapsed,setLayout }: NavProps) {
  const ctx = context()
  const {isMobile} = ctx.state

  return (
      <div
      data-collapsed={isCollapsed}
      className="group relative flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
      >
        {isTop && (
          <Button 
            variant={"outline"} 
            className="absolute min-w-min -end-[6.1px] -bottom-4 z-10 h-7 w-7" 
            size={'icon'}
            onClick={()=> {
              if (isTop && setIsCollapsed){
                if (!isCollapsed){
                  const arrValue = [4,96]
                  setLayout(arrValue)
                  document.cookie = `react-resizable-panels:layout=${arrValue}; path=/`
                }else {
                  const arrValue = !isMobile ? [20, 80] : [100, 0]
                  setLayout(arrValue)
                  document.cookie = `react-resizable-panels:layout=${arrValue}; path=/`
                }
                document.cookie =`react-resizable-panels:collapsed=${!isCollapsed}; path=/`
                return setIsCollapsed(!isCollapsed)
              }
            }}
            >
              {isCollapsed ? <ChevronsRight size={25}/>: <ChevronsLeft size={25}/>}
          </Button>
        )}
        <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {links.map((link,index)=>(
            <Item 
              key={index} 
              link={link} 
              isCollapsed={isCollapsed} 
              setIsCollapsed={setIsCollapsed} 
              setLayout={setLayout}
              id={index}
            />
          ))}
        </nav>
      </div>
  )
}