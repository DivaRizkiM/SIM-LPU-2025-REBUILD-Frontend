import { ModeToggle } from "@/components/tools/mode-toggle"
import UserNav from "./UserNav"
import Image from "next/image"
import { buttonVariants } from "../ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

const TopBar = () => {
  return (
    <div className="flex items-center justify-between space-y-2 py-3 pr-5 border-b">
      <Link
        href={'/main'}
        className={cn(
          buttonVariants({ variant: 'link' }),
          "relative ml-4 w-14 h-10"
        )}>
        <Image src={'/icons/Komdigi.svg'} alt="Komdigi" fill={true} className="object-cover" />
      </Link>
      <div>
        {/* <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground"> */}
        {/* </p> */}
      </div>
      <div className="flex items-center space-x-4">
        <ModeToggle />
        <UserNav />
      </div>
    </div>
  )
}

export default TopBar