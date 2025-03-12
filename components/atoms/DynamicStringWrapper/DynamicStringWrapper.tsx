import { WrappedTooltip } from "@/components/wrappedNextUI/Tooltip/Tooltip";
import { shortenString } from "@/lib/utils";

export function DynamicStringWrapper({
  string,
  maxLength = 10,
}: {
  string: string;
  maxLength?: number;
}) {
  const isLongString = string.length > maxLength;

  if (isLongString) {
    return (
      <WrappedTooltip content={string}>
        {shortenString(string, maxLength / 2)}
      </WrappedTooltip>
    );
  }
  return string;
}
