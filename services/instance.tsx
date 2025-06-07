import axios, { AxiosError } from "axios";
import { getLocalStorage, setToLocalStorage } from "../store/local_storage";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { setupCache } from 'axios-cache-interceptor'; 
import { toast } from "@/components/ui/use-toast";
const EXAMPLE_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string
// without auth guard
export const nonGuardInstance = () => {
  const instance = axios.create({
    baseURL: EXAMPLE_BACKEND_URL,
  })
  const instanceCached = setupCache(instance,{
    // storage: buildWebStorage(localStorage, 'axios-cache:'),
    // ttl: 1000 * 60 * 5, // 5 Minutes,
  });
  
  instanceCached.interceptors.request.use((config:any) => {
    config.headers = {
      'api-key': `${process.env.NEXT_PUBLIC_API_SECRET_KEY as string}`
    }
    return config
  })
  instanceCached.interceptors.response.use(undefined, (err: AxiosError) => {
    return Promise.reject(err);
  })
  return instanceCached
}

export const UseGuardInstance = (router: AppRouterInstance) => {
  const newInstance = axios.create({
    baseURL: EXAMPLE_BACKEND_URL,
  })
  
  newInstance.interceptors.request.use((config:any) => {
    config.headers = {
      'Authorization': `Bearer ${getLocalStorage().accessToken}` || false,
      'api-key': `${process.env.NEXT_PUBLIC_API_SECRET_KEY as string}`,
      'cache-Control': 'max-age=15 * 60 * 1000, stale-while-revalidate=1800',
    }
    return config
  })
  newInstance.interceptors.response.use(undefined, (err: AxiosError) => {
    if (err.code !== "ERR_CANCELED") {
      if (err.response?.status === 401) {
        setToLocalStorage({
          // admin: undefined,
          accessToken: undefined
        })
      if (err.response.config.url !== "/auth") router.push("/auth")
        toast({
          title: 'Token kredensial anda telah kadaluarsa, silahkan melakukan Login kembali!',
          variant: 'destructive',
          
        })
      }
    }
    return Promise.reject(err);
  })
  return newInstance
}

export default UseGuardInstance