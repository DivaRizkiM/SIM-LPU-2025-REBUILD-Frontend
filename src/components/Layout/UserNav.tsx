import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { postLogout } from "../../../services"
import { useRouter } from "next/navigation"
import { toast } from "../ui/use-toast"
import { useEffect, useState } from "react"
import { getLocalStorage } from "../../../store/local_storage"
import { LogOut } from "lucide-react"

export function UserNav() {
  const router = useRouter()
  const [username, setUsername] = useState<string>()

  const logOutHandler = async()=> {
    await postLogout(router,'')
      .then(()=> {
        return router.replace('/')
      })
      .catch((err)=> {
        console.log('Err: ',err);
        toast({
          title: err.response.data.message || err.message ,
          variant: 'destructive'
        })
      })
  }

  const firstInit = ()=> {
    if (getLocalStorage().admin){
      setUsername(getLocalStorage().admin?.username)
    }
  }
  useEffect(firstInit,[])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/03.png" alt="@shadcn" />
            <AvatarFallback>{username?.slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              m@example.com
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={logOutHandler}>
          Log out
          <DropdownMenuShortcut>
            <LogOut className="w-5 h-5"/>
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserNav