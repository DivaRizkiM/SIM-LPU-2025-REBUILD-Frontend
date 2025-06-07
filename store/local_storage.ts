import CryptoJS from 'crypto-js'
import { Admin } from '../services/types'

const { AES, enc } = CryptoJS
const LOCALSTORAGE_KEYNAME = 'store'
export const HASH_SECRET_KEY = 's3Cr3t_K3y'

export interface PersistentState {
  admin?: Admin;
  accessToken?: string;
}

export const persistentState: PersistentState = {

}

export const getLocalStorage = () => {
  const storage = localStorage.getItem(LOCALSTORAGE_KEYNAME)

  if(storage){
    // decrypt hash
    const bytes = AES.decrypt(storage, HASH_SECRET_KEY);
    try {
      return JSON.parse(bytes.toString(enc.Utf8)) as PersistentState
    }
    catch(err){
      // return default value when decrypt is failed
      return persistentState
    }
  }
  else return persistentState
}

export const setToLocalStorage = (state: Partial<PersistentState>) => {
  const newStore: PersistentState = {
    ...getLocalStorage(),
    ...state
  }
  // encrypt localStorage object to hash
  const encryptedData = AES.encrypt(JSON.stringify(newStore), HASH_SECRET_KEY)
  localStorage.setItem(LOCALSTORAGE_KEYNAME, encryptedData.toString())
}