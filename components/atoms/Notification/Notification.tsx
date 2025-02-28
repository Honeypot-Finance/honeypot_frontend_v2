import { cn } from "@/lib/utils";
import { observer } from "mobx-react-lite";

type NotificationProps = {
  children: React.ReactNode;
  notify: boolean;
  dotSize?: number;
  dotColor?: string;
  classNames?: {
    container: string;
    dot: string;
  };
};

export const Notification = observer(
  ({
    children,
    notify,
    dotSize = 10,
    dotColor = "#ff0000", // red
    classNames,
  }: NotificationProps) => {
    return (
      <div className={cn("relative overflow-visible", classNames?.container)}>
        {notify && (
          <div
            className={cn(
              `absolute top-0 right-0 translate-x-[50%] translate-y-[-50%] w-[10px] h-[10px] bg-red-500 rounded-full z-10`,
              classNames?.dot
            )}
          />
        )}
        {children}
      </div>
    );
  }
);
