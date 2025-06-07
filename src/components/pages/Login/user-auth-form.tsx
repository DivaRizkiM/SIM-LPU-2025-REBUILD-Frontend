"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { postSignIn } from "../../../../services"
import { setToLocalStorage } from "../../../../store/local_storage"
import { toast } from "@/components/ui/use-toast"
import { IFormLogin } from "../../../../services/types"
import { useReCaptcha } from "next-recaptcha-v3"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const router = useRouter()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [username,setUsername] = React.useState<string>('')
  const [password,setPassword] = React.useState<string>('')
  const { executeRecaptcha } = useReCaptcha();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    // Generate ReCaptcha token
    const token = await executeRecaptcha("login");
    
    // Attach generated token to your API requests and validate it on the server
    const responseRecaptcha = await fetch("/api/verify-recaptcha", {
      method: "POST",
      body: JSON.stringify({token}),
    });
    try {
      const dataRecaptcha = await responseRecaptcha.json()
      if (!dataRecaptcha.success) {
        setIsLoading(false)
        return toast({
          title: 'reCAPTCHA verification failed',
          variant: 'destructive'
        })
      }
    } catch (error) {
      setIsLoading(false)
      return toast({
        title: 'Something wrong with reCAPTCHA verification',
        variant: 'destructive'
      })
    }
    const payload:IFormLogin = {
      username: username,
      password_hash: password
    }
    postSignIn(payload)
      .then((res)=>{
        setToLocalStorage({
          admin: {
            id: parseInt(res.data.data.id),
            username: res.data.data.username as string,
            role : {
              id: 1,
              nama: 'admin'
            }
          },
          accessToken: res.data.data.token
        })
        return router.push('/main')
      })
      .catch((err)=>{
        console.log('Err: ',err);
        toast({
          title: err?.response?.data?.error || err.message,
          variant: 'destructive'
        })
      })
      .finally(()=>{
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      })
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="username">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e)=>setUsername(e.currentTarget.value)}
              placeholder="username"
              type="username"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Kata Sandi
            </Label>
            <Input
              id="password"
              value={password}
              onChange={(e)=>setPassword(e.currentTarget.value)}
              placeholder="******"
              type="password"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Masuk
          </Button>
        </div>
      </form>
     
    </div>
  )
}