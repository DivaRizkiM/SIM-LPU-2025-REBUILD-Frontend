"use client";
import * as React from "react";
import { FC, useEffect, useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { context } from "../../../store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const DrawerModal: FC = () => {
  const ctx = context();

  const closeHandler = () => {
    ctx.dispatch({ isModal: undefined });
  };

  // --- GUARD: abaikan outside events sebentar setelah open untuk cegah auto-close ---
  const open = !!ctx.state.isModal;
  const ignoreOutsideRef = useRef(false);

  useEffect(() => {
    if (open) {
      // aktifkan guard selama 150ms setelah dibuka
      ignoreOutsideRef.current = true;
      const t = setTimeout(() => {
        ignoreOutsideRef.current = false;
      }, 150);
      return () => clearTimeout(t);
    }
  }, [open]);

  // helper: prevent outside interaction saat guard aktif
  const guardOutside = (e: Event) => {
    if (ignoreOutsideRef.current) {
      e.preventDefault();
    }
  };

  // apakah ada deskripsi? (buat a11y)
  const hasDesc = Boolean(ctx.state.isModal?.desc);

  if (ctx.state.isModal?.type === "modal") {
    return (
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) closeHandler();
        }}
      >
        <DialogContent
          className={`max-w-[97vw] ${
            ctx.state.isModal?.fullWidth
              ? "sm:max-w-[80vw]"
              : "sm:max-w-[525px]"
          } max-h-[90dvh] overflow-scroll`}
          // Matikan auto-focus default biar gak bentrok sama fokus lama (dropdown)
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          // Cegah auto-close karena event bocor dari dropdown tepat setelah open
          onPointerDownOutside={guardOutside}
          onInteractOutside={guardOutside}
          // Fix warning a11y jika tidak ada Description
          aria-describedby={hasDesc ? undefined : undefined}
        >
          <DialogHeader>
            <DialogTitle>{ctx.state.isModal?.title}</DialogTitle>
            {hasDesc && (
              <DialogDescription>{ctx.state.isModal?.desc}</DialogDescription>
            )}
          </DialogHeader>

          {ctx.state.isModal?.component}

          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={closeHandler}
          >
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogContent>
      </Dialog>
    );
  }

  // Drawer
  return (
    <Drawer
      open={open}
      // beberapa wrapper Drawer pakai onOpenChange, sebagian custom pakai onClose—kita pasang keduanya
      onOpenChange={(v) => {
        if (!v) closeHandler();
      }}
    >
      <DrawerContent
        // Matikan auto-focus default + guard outside events
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={guardOutside}
        onInteractOutside={guardOutside}
        // Fix warning a11y jika tidak ada Description
        aria-describedby={hasDesc ? undefined : undefined}
      >
        <div className="md:w-[50vw] md:m-auto">
          <DrawerHeader>
            <DrawerTitle>{ctx.state.isModal?.title}</DrawerTitle>
            {hasDesc && (
              <DrawerDescription>{ctx.state.isModal?.desc}</DrawerDescription>
            )}
          </DrawerHeader>

          <div className="mx-4 mb-4 md:mb-9">
            {ctx.state.isModal?.component}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerModal;
