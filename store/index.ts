'use client'
import { createContext, Dispatch, useContext } from 'react'
import { globalState, GlobalStateType } from './state'

export interface InitialContextType {
	state: GlobalStateType;
	dispatch: Dispatch<Partial<GlobalStateType>>
}

export const initialContext: InitialContextType = {
	state: globalState,
	dispatch: () => null
}

export const StoreContextWrapper = createContext(initialContext)

export const context = () => useContext(StoreContextWrapper)