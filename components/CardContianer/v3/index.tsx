import Image from "next/image";
import { ReactNode } from "react";
import { cn } from "@/lib/tailwindcss";
import { LoadingDisplay } from "@/components/LoadingDisplay/LoadingDisplay";

interface HoneyContainerProps {
  children: ReactNode;
  bordered?: boolean;
  variant?: "default" | "wide";
  className?: string;
  showTopBorder?: boolean;
  showBottomBorder?: boolean;
  empty?: boolean;
  loading?: boolean;
  type?: "primary" | "default";
  loadingText?: string;
  topBorderOffset?: number;
}

function CardContainer({
  children,
  className,
  loadingText,
  empty = false,
  loading = false,
  bordered = true,
  type = "primary",
  variant = "default",
  showTopBorder = true,
  topBorderOffset = -65,
  showBottomBorder = true,
}: HoneyContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full w-full gap-y-4 justify-center items-center rounded-2xl text-[#202020]",
        type === "primary"
          ? "bg-[#FFCD4D]"
          : bordered
            ? "border-3 border-[#F2C34A] bg-transparent"
            : "bg-transparent",
        bordered &&
          [
            "px-4",
            "bg-repeat-x",
            showTopBorder && [
              "pt-12 sm:pt-20",
              `bg-[position:${topBorderOffset}px_0]`,
              "bg-[length:auto_40px] sm:bg-[length:auto_70px]",
              "bg-[url('/images/card-container/honey/honey-border.png')]",
            ],
            showBottomBorder && [
              "pb-12 sm:pb-20",
              "bg-left-bottom",
              "bg-[length:auto_40px] sm:bg-[length:auto_70px]",
              variant === "wide"
                ? "bg-[url('/images/card-container/honey/bottom-border.svg')]"
                : "bg-[url('/images/card-container/dark/bottom-border.svg')]",
            ],
          ]
            .flat()
            .filter(Boolean)
            .join(" "),
        className
      )}
    >
      {loading ? (
        <LoadingDisplay size={100} text={loadingText} />
      ) : empty ? (
        <div className="flex flex-col justify-center items-center min-h-[200px] space-y-5">
          <Image
            width={100}
            height={100}
            alt="No Data"
            src={"/images/honey-stick.svg"}
          />
          <p className="text-[#FFCD4D] text-5xl">No Data</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default CardContainer;
