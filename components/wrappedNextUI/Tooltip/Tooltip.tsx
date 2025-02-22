import { Tooltip, TooltipProps } from "@nextui-org/react";

export function WrappedTooltip(props: TooltipProps) {
  return (
    <Tooltip
      classNames={{
        base: "",
        content: "bg-[#6B4311]",
      }}
      {...props}
    />
  );
}
