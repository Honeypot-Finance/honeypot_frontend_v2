import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";

type NotificationProps = {
  children: React.ReactNode;
  notify: boolean;
  dotSize?: number;
  dotColor?: string;
  className?: string;
};

export const Notification = observer(
  ({
    children,
    notify,
    dotSize = 10,
    dotColor = "#ff0000", // red
    className,
  }: NotificationProps) => {
    return (
      <div className={cn("relative overflow-visible", className)}>
        {notify && (
          <div
            className={cn(
              `absolute top-0 right-0 translate-x-[50%] translate-y-[-50%] w-[${dotSize}px] h-[${dotSize}px] bg-[${dotColor}] rounded-full z-10`
            )}
          />
        )}
        {children}
      </div>
    );
  }
);
