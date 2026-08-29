import * as React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-72 max-w-[80vw]">
        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
        <Sidebar onItemClick={() => onOpenChange(false)} className="w-full border-none" />
      </SheetContent>
    </Sheet>
  );
}
