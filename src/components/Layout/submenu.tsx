import React, { useEffect } from 'react';
import Link from 'next/link';
import { CornerDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/button';
import { usePathname } from 'next/navigation';
import { context } from '../../../store';

interface SubMenuProps {
  items: {
    title: string
    label?: string
    url:string
    variant: "default" | "ghost"
  }[];
  setLayout: any
}

const SubMenu: React.FC<SubMenuProps> = ({ items,setLayout }) => {
    const pathname = usePathname()
    const ctx = context()
    const { isMobile } = ctx.state

    const isActive = (url:string)=> {
        return pathname.startsWith(url)
    }
    const checkVariant= (url:string): "default"|"ghost" => {
        if (isActive(url)){
            return "default"
        }
        return 'ghost'
    }
    
    return (
        <ul className='bg-primary-foreground rounded-md overflow-hidden'>
        {items.map((item, index) => (
            <li key={index}>
                <Link href={item.url} 
                className={cn(
                    buttonVariants({ variant: checkVariant(item.url),size: 'sm' }),
                    checkVariant(item.url) === "default" &&
                    "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                    "justify-start w-full ps-3 rounded-none"
                )}
                onClick={()=> {
                    if (isMobile){
                        setLayout([4,96])
                    }
                }}
                >
                    <CornerDownRight className='mr-2 w-4 h-4'/>
                    {item.title}
                </Link>
            </li>
        ))}
        </ul>
    );
};

export default SubMenu;
