import { cn } from "@/lib/tailwindcss";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";
import { SlOptions, SlShare } from "react-icons/sl";
import { VscCopy } from "react-icons/vsc";
import { toast } from "react-toastify";
import * as clipboard from "clipboard-polyfill";
import CopyToClipboard from "react-copy-to-clipboard";
import { shareMediaToast } from "../ShareSocialMedialPopUp/ShareSocialMedialPopUp";

type optionItem = {
  icon: JSX.Element;
  display: string | JSX.Element;
  onClick?: () => void;
};

interface OptionsDropdownProps {
  className?: string;
  options: optionItem[];
}

export const optionsPresets = {
  copy: ({
    copyText,
    displayText,
    copysSuccessText,
  }: {
    copyText: string;
    displayText?: string;
    copysSuccessText?: string;
  }) => {
    return {
      icon: <VscCopy />,
      display: displayText ?? "Copy",
      onClick: async () => {
        if (window.navigator.clipboard) {
          window.navigator.clipboard
            .writeText(copyText)
            .then(() => {
              toast.success(copysSuccessText ?? "Copied");
            })
            .catch((error) => {
              console.error("Copy failed", error);
            });
        } else {
          clipboard.writeText(copyText).then(
            () => {
              toast.success(copysSuccessText ?? "Copied");
            },
            (error: Error) => {
              toast.error(
                <div>
                  <h3>
                    Copy failed, please do it manually, click this message to
                    open prompt:
                  </h3>
                  <p>{copyText}</p>
                </div>,
                {
                  autoClose: false,
                  onClick: () => {
                    window.prompt("Copy to clipboard: Ctrl+C, Enter", copyText);
                  },
                }
              );
              console.error("Copy failed", error);
            }
          );
        }
      },
    };
  },
  share: ({
    shareText,
    shareUrl,
    displayText,
  }: {
    shareText: string;
    shareUrl: string;
    displayText?: string;
  }) => {
    return {
      icon: <SlShare />,
      display: displayText ?? "Share",
      onClick: () =>
        shareMediaToast({
          shareUrl: shareUrl,
          shareText: shareText,
          text: "Share this project",
        }),
    };
  },
};

export function OptionsDropdown(props: OptionsDropdownProps) {
  return (
    <Dropdown className="text-3xl">
      <DropdownTrigger>
        <Button className={cn("bg-transparent min-w-0", props.className)}>
          <SlOptions
            size={20}
            className="cursor-pointer hover:text-[#F7931A]"
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Dynamic Actions">
        {props.options.map((option, index) => (
          <DropdownItem
            key={index}
            onClick={() => {
              option.onClick && option.onClick();
            }}
            onTouchStart={() => {
              option.onClick && option.onClick();
            }}
            startContent={option.icon}
          >
            {option.display}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
