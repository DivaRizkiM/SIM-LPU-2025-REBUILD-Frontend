import { RefObject, useEffect, useRef } from "react";
import { InitialContextType } from "../store";

export function destroyDrawerModal(ctx:InitialContextType) {
    return ctx.dispatch({
        isModal: undefined
    })
}
export function destroyAlertDialog(ctx:InitialContextType) {
    return ctx.dispatch({
        alertDialog: undefined
    })
}
interface Errorz {
	[key: string]: string;
}
export const stringifyError = (error: Errorz) => {
  if (typeof error !== 'object'){
    return "Something wrong.."
  }
	return "Error: " + Object.values(error).join(", ");
}

export const debounce = <T extends (...args: any) => any>(func: T, wait?: number) => {
    let timeout: NodeJS.Timeout | number | undefined;
    return (...args: any) => {
      const later = () => {
        timeout = undefined;
        
        func(...args);
      };
      clearTimeout(timeout as number | undefined);
      
      timeout = setTimeout(later, wait);
    };
  };
// Hook func vers.
export const useDebounce = <T extends (...args: any) => any>(func: T, args: Array<any>, wait?: number, funcBeforeDebounce?: () => void) => {
	const debounceProcess = useRef(debounce(func, wait))
	
	const listener = () => {
		if (funcBeforeDebounce) funcBeforeDebounce()
		debounceProcess.current(...args)
	}

	useEffect(listener, [...args])
}
export function getQuarter(no_urut_bulan:number) {
  const monthsToQuarters: Record<number, number> = {
    1: 1, 2: 1, 3: 1,     // Triwulan 1 untuk Januari, Februari, Maret
    4: 2, 5: 2, 6: 2,     // Triwulan 2 untuk April, Mei, Juni
    7: 3, 8: 3, 9: 3,     // Triwulan 3 untuk Juli, Agustus, September
    10: 4, 11: 4, 12: 4,  // Triwulan 4 untuk Oktober, November, Desember
  };

  // Mengembalikan nilai triwulan berdasarkan bulan
  return monthsToQuarters[no_urut_bulan] || -1;
}
export const formatCurrency = (value: string) => {
  const numberValue = value.replace(/[^\d]/g, '');
  const formattedNumber = new Intl.NumberFormat('id-ID').format(Number(numberValue));
  return formattedNumber;
};
export const cleanCurrencyFormat = (value: string) => {
  let cleanedString =  value.replace(/Rp|\,|\s|\.\d{2}(?!\d)/g, '');
  // Menghapus dua angka terakhir setelah koma jika ada
  if (value.includes(',')) {
      cleanedString = cleanedString.slice(0, cleanedString.length - 2);
  }
  return cleanedString;
}
export const numFormatter = (n: string | number | bigint, decimalSymbol?: string) => {
	if(Number(n) > 0) {
    const splitNumber = String(n).split(decimalSymbol || ".")
    if(splitNumber.length > 1) return splitNumber[0].replace(/(.)(?=(\d{3})+$)/g,'$1.') + `,${splitNumber[1]}`
    else return String(n).replace(/(.)(?=(\d{3})+$)/g,'$1.')
  }
  else {
    const splitNumber = String(Number(n) * -1).split(decimalSymbol || ".")
    if(splitNumber.length > 1) return "-" + splitNumber[0].replace(/(.)(?=(\d{3})+$)/g,'$1.') + `,${splitNumber[1]}`
    else return String(n).replace(/(.)(?=(\d{3})+$)/g,'$1.')
  }
}
export interface QueryParams {
  [key: string]: string | undefined;
}
export const buildQueryParam = (params: QueryParams): string => {
  let param = '';

  for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          if (value) {
              param += param ? `&${key}=${value}` : `${key}=${value}`;
          }
      }
  }

  return param ? `?${param}` : '';
}
export const splitTimeRangeString = (timeRange: string): string[] => {
  // Split the string based on ' s/d ' and space
  if (!timeRange) {
    return ['', '']; // Return empty array if timeRange is empty
  }
  
  const [startTime, endTime] = timeRange.split(/ s\/d | /);
  return [startTime, endTime];
};
export const isLastPage = (total_data_on_a_page:number|undefined,pageSize:number)=> {
  if  (total_data_on_a_page || total_data_on_a_page === 0){
    return total_data_on_a_page < pageSize ;
  }
  return false
}
export const smoothScroll = (elementId: string, headerHeight: number, ref:RefObject<any>) => {
  
  const element = document.getElementById(elementId);
  if (element) {
    const scrollElement = element.offsetTop;
    ref.current.scrollTo({
      top: scrollElement - headerHeight,
      behavior: 'smooth'
    });
  }
}
export const isUrlValid = (url: string): boolean => {
  // Define a regular expression for URLs that end with a single character or just a slash
  const emptyPattern = /\/([^\/]|)\/?$/;

  // Check if the URL matches the empty pattern
  return !emptyPattern.test(url);
};
export function getMonthName(monthNumber: number): string {
  const monthNames: string[] = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error("Nomor bulan harus antara 1 dan 12.");
  }

  return monthNames[monthNumber - 1];
}

export const convertDate = (dateInit: string) => {
	if (dateInit.includes('T')) {
		const newDate = new Date(dateInit);
		const month = newDate.toLocaleString("id-ID", { month: "long" });
		const day = newDate.toLocaleString("id-ID", { day: "numeric" });
		const dayword = newDate.toLocaleString("id-ID", { weekday: "long" });
		const year = newDate.toLocaleString("id-ID", { year: "numeric" });
		const time = newDate.toLocaleTimeString("id-ID");

		return `${month}, ${day} ${year}
		${dayword} ${time}`;
	}
	return ''
}

export const getFileFormat = (url:string) => {
  if (!url) return null; // Pastikan `url` ada sebelum diproses
  return url.split('.').pop()?.toLowerCase() || 'unknown';
};

export function separateDate(dateString: number): { year: number, month: number } {
  const tanggalString = dateString.toString();

  const year = parseInt(tanggalString.slice(0, 4));
  const month = parseInt(tanggalString.slice(4));

  return { year, month };
}