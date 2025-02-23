import { cn } from "@/lib/tailwindcss";

interface CartoonButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const CartoonButton = ({
  children,
  className,
  onClick,
}: CartoonButtonProps) => {
  return (
    <div
      className={cn(onClick && "cursor-pointer", "relative")}
      onClick={onClick}
    >
      <div
        className={cn(
          "rounded-small dark:bg-default bg-[#FFCD4D] border border-black shadow-[2px_2px_0px_0px_#000000] text-sm inline-block p-2",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
