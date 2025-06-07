import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const addMaximumScaleToMetaViewport = () => {
  if (typeof window !== 'undefined') {
    const el = document.querySelector('meta[name=viewport]');

    if (el !== null) {
      let content = el.getAttribute('content');
      let re = /maximum\-scale=[0-9\.]+/g;

      if (content) {
        if (re.test(content)) {
          content = content.replace(re, 'maximum-scale=1.0');
        } else {
          content = [content, 'maximum-scale=1.0'].join(', ');
        }

        el.setAttribute('content', content);
      }
    }
    
    
  }
};

export const disableIosTextFieldZoom = addMaximumScaleToMetaViewport;

export const checkIsIOS = () =>
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent)


export const handleIOSZoom = () => {
  
    disableIosTextFieldZoom();
  
};
