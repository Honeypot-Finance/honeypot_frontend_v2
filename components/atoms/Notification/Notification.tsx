type NotificationProps = {
  children: React.ReactNode;
  notify: boolean;
  dotSize?: number;
  dotColor?: string;
};

export const Notification = ({
  children,
  notify,
  dotSize = 10,
  dotColor = "red",
}: NotificationProps) => {
  return (
    <div className="w-full h-full">
      {notify && (
        <div
          className={`absolute top-0 right-0 translate-x-[-50%] translate-y-[50%] w-${dotSize} h-${dotSize} bg-${dotColor} rounded-full`}
        />
      )}
      {children}
    </div>
  );
};
