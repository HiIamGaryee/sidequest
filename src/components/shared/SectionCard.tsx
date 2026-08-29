import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  children?: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
}

export function SectionCard({
  title,
  description,
  headerAction,
  footer,
  children,
  className,
  contentClassName,
  ...props
}: SectionCardProps) {
  return (
    <Card className={cn("bg-[#18181b] border-[#27272a] rounded-xl shadow-xs", className)} {...props}>
      {(title || description || headerAction) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5 pb-3">
          <div className="space-y-1">
            {title && (
              <CardTitle className="text-sm font-semibold tracking-tight text-[#fafafa]">{title}</CardTitle>
            )}
            {description && (
              <CardDescription className="text-xs text-[#71717a]">{description}</CardDescription>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-5 pt-0", contentClassName)}>
        {children}
      </CardContent>
      {footer && <CardFooter className="p-5 pt-0">{footer}</CardFooter>}
    </Card>
  );
}
