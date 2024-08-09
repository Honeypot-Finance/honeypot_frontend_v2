import { Tooltip } from "@nextui-org/react";
import clsx from "clsx";
import { set } from "lodash";
import { observer, useLocalObservable } from "mobx-react-lite";
import { HTMLAttributes } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { IconType } from "react-icons/lib";
import { VscCopy } from "react-icons/vsc";

export const CopyTrigger = observer(
  ({
    state,
    className,
    content,
    copiedContent,
    ...props
  }: {
    state: {
      copied: boolean;
      isTooltipOpen: boolean;
      setTooltipOpen(value: boolean): void;
      setCopied(value: boolean): void;
    };
    content?: string;
    copiedContent?: string;
  } & Partial<IconType> &
    Partial<HTMLAttributes<any>>) => {
    return (
      <Tooltip
        color="primary"
        isOpen={state.isTooltipOpen}
        content={state.copied ? copiedContent ?? "Copied" : content ?? "Copy"}
      >
        <span
          onMouseEnter={() => {
            state.setTooltipOpen(true);
          }}
          onMouseLeave={() => {
            state.setTooltipOpen(false);
            state.setCopied(false);
          }}
          className={clsx(
            "inline-block cursor-pointer hover:text-primary",
            className
          )}
        >
          <VscCopy className="w-full h-full" {...props}></VscCopy>
        </span>
      </Tooltip>
    );
  }
);

export const Copy = observer(
  ({
    value,
    ...props
  }: { value: string } & Partial<IconType> & Partial<HTMLAttributes<any>>) => {
    const state = useLocalObservable(() => ({
      copied: false,
      isTooltipOpen: false,
      setTooltipOpen(value: boolean) {
        this.isTooltipOpen = value;
      },
      setCopied(value: boolean) {
        this.copied = value;
      },
    }));
    return (
      <CopyToClipboard
        text={value}
        onCopy={() => {
          console.log("copied");
          state.setCopied(true);
        }}
      >
        <CopyTrigger state={state} {...props}></CopyTrigger>
      </CopyToClipboard>
    );
  }
);
