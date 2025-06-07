"use client"
import { FC, useState } from "react";
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CaretSortIcon, CheckIcon, ReloadIcon } from "@radix-ui/react-icons"
import { FormCustomOption } from "../../../store/state";
import { FormLabel } from "../ui/form";

interface ComboboxProps {
    value?: string,
    options: FormCustomOption[],
    placeholder: string,
    onSelect: ((value: string) => void) ,
    disabled?: boolean,
    isLoading?: boolean,
}
const Combobox:FC<ComboboxProps> = ({value,options,placeholder,onSelect,disabled=false,isLoading})=> {
    const [open, setOpen] = useState(false)
    
    return(
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    disabled={disabled}
                    >
                        <span className="flex">
                            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                            {value
                                ? options.find((option) => option.value === value)?.label
                                : placeholder
                            }
                        </span>
                        <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 popover-content-width-same-as-its-trigger">
                    <Command>
                        <CommandInput 
                        placeholder={placeholder} className="h-9"/>
                        {options.length === 0 && (
                            <div className="py-6 text-center text-sm">Data tidak ditemukan.</div>
                        )}
                        
                        <CommandGroup className="max-h-96 overflow-scroll">
                            {options.map((option) => (
                            <CommandItem
                                key={option.value}
                                value={option.label as string}
                                onSelect={() => {
                                    onSelect(option.value as string)
                                    setOpen(false)
                                }}
                                className={`${value === option.value ? 'dark:bg-sky-400/10 bg-sky-200/25':''}`}
                            >
                                {option.label}
                                <CheckIcon
                                className={cn(
                                    "ml-auto h-4 w-4",
                                    value === option.value ? "opacity-100" : "opacity-0"
                                )}
                                />
                            </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </>
    )
}

export default Combobox