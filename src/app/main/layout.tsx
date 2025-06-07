import Dashboard from "@/components/Layout"
import { cookies } from "next/headers"
// import { useRef } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const layout = cookies().get("react-resizable-panels:layout")
    const collapsed = cookies().get("react-resizable-panels:collapsed")
  
    const defaultLayout = layout ? JSON.parse(layout.value) : undefined
    const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : false
    
    
    return(
        <div>
            <Dashboard
             defaultLayout={defaultLayout}
             defaultCollapsed={defaultCollapsed}
             navCollapsedSize={4}
            >
                {children}
            </Dashboard>
        </div>
    )
}
