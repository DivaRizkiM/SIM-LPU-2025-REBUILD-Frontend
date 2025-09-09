import { FC, useEffect, useState } from "react"
import { KeteranganI } from "../../../../../services/types"
import { useRouter } from "next/navigation"
import { getDetailApiLog } from "../../../../../services"
import { DetailSyncLog } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

interface ModalApiLogI {
    id:number
}
const ModalApiLog:FC<ModalApiLogI> = ({id})=>{
  const router = useRouter()
  const [dataSource,setDataSource] = useState<DetailSyncLog>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  const firstInit = async ()=> {
    setIsLoading(true)
    await getDetailApiLog(router,id)
      .then((res:any)=> {
        setDataSource(res.data)
      })
      .catch((err)=> {
        toast({
          variant: 'destructive',
          title: 'Something went wrong...'
        })
      })
      .finally(()=>{
        setIsLoading(false)
      })
  }

  useEffect(()=>{
    firstInit()
    /* eslint-disable react-hooks/exhaustive-deps */
  },[])
  return (
        <div className="grid gap-4">
          <div className="rounded-md bg-black p-6 overflow-x-scroll min-h-[200px]">
            <pre>
              <code className="grid gap-1 text-sm text-muted-foreground [&_span]:h-4">
              {dataSource && dataSource.log_info  ? (
              
                  <div style={{ marginBottom: "10px" }}>
                    {Object.entries(dataSource.log_info).map(
                      ([key, value]) =>
                        key !== "size" ? (
                          <span key={key}>
                            {key}: {value};{" "}
                          </span>
                        ) : null
                    )}
                  </div>
              ) : (
                <span>
                  {isLoading ? 'Loading..,' : 'Kosong'}
                </span>
              )}
              {dataSource && dataSource.data && dataSource.data.length > 0  ? (
                dataSource.data.map((item, index) => (
                  <div key={index} style={{ marginBottom: "10px" }}>
                    {Object.entries(item).map(
                      ([key, value]) =>
                        key !== "size" ? (
                          <span key={key}>
                            {key}: {value};{" "}
                          </span>
                        ) : null
                    )}
                    <span>---- size: {item.size}</span>
                  </div>
                ))
              ) : (
                <span>
                  {isLoading ? 'Loading..,' : 'Kosong'}
                </span>
              )}
              </code>
            </pre>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
            The <code>keterangan</code> data provides detailed information about various expense categories, including IDs, regional codes, financial details, and descriptions. This data is formatted as a JSON string.
            </p>
          </div>
        </div>
  )
}
export default ModalApiLog