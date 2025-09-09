'use client'
import { FC } from "react";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
  } from "@/components/ui/drawer"
  import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import { context } from "../../../store";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
// import { checkIsIOS } from "@/lib/utils";

const DrawerModal:FC = ()=> {
    const ctx = context()

    const closeHandler = ()=> {
        ctx.dispatch({
            isModal: undefined
        })
    }

    if (ctx.state.isModal?.type === "modal"){
        return(
            <Dialog 
            open = {!!ctx.state.isModal}
            >
                <DialogContent className={`max-w-[97vw] ${ctx.state.isModal.fullWidth ? 'sm:max-w-[80vw]' : 'sm:max-w-[525px]'} max-h-[90dvh] overflow-scroll`} onInteractOutside={closeHandler}>
                    <DialogHeader>
                        <DialogTitle>{ctx.state.isModal?.title}</DialogTitle>
                        {ctx.state.isModal?.desc && (
                            <DialogDescription>
                                {ctx.state.isModal?.desc}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    { ctx.state.isModal?.component && (
                        ctx.state.isModal?.component
                    )}
                    <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" onClick={closeHandler}>
                        <Cross2Icon className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                </DialogContent>
            </Dialog>
        )
    }
    else {
        return(
            <Drawer 
            open = {!!ctx.state.isModal}
            onClose={closeHandler}
            >
                <DrawerContent onInteractOutside={closeHandler}>
                    <div className={`md:w-[50vw] md:m-auto`}>
                        <DrawerHeader>
                            <DrawerTitle>{ctx.state.isModal?.title}</DrawerTitle>
                            {ctx.state.isModal?.desc &&(
                                <DrawerDescription>{ctx.state.isModal?.desc}</DrawerDescription>
                            )}
                        </DrawerHeader>
                        <div className="mx-4 mb-4 md:mb-9">
                            { ctx.state.isModal?.component && (
                                ctx.state.isModal?.component
                            ) }
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

}

export default DrawerModal