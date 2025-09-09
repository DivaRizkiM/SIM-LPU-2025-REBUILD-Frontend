'use client'

import { ThemeProvider } from "@/components/theme-provider"
import { StoreContextWrapper } from '../../store'
import { useReducer } from 'react'
import reducer from '../../store/reducer'
import { globalState } from '../../store/state'

export default function Providers({ children }: { children: React.ReactNode }) {

  const [state, dispatch] = useReducer(reducer, globalState)
  
    return(
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        >
            <StoreContextWrapper.Provider value={ {state, dispatch} }>
                {children}
            </StoreContextWrapper.Provider>
        </ThemeProvider>
    )
}