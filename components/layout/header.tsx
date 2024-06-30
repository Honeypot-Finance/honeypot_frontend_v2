import { HtmlHTMLAttributes, useState } from "react";
import { Logo } from "../svg/logo";
import { WalletConnect, WalletConnectMobile } from "../walletconnect";
import clsx from "clsx";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@nextui-org/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { cn } from "@/lib/tailwindcss";

export const Header = (props: HtmlHTMLAttributes<any>) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuList: {
    path: string;
    title: string;
  }[] = [
    {
      path: "/swap",
      title: "Swap",
    },
    {
      path: "/faucet",
      title: "Faucet",
    },
    {
      path: "/pools",
      title: "Pools",
    },
    {
      path: "/launch",
      title: "Launch",
    },
    {
      path: "/price",
      title: "price",
    },
  ];
  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        wrapper: "max-w-[1200px]",
      }}
      className={clsx("h-[63px] bg-transparent", props.className)}
      style={{
        backdropFilter: "none",
      }}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden  text-[white]"
        />
        <NavbarBrand>
          <Link href="/">
            <Logo />
          </Link>
          <p className='ml-[4px] w-[171px] h-8 text-[#FFCD4D] [font-family:"Bebas_Neue"] text-[28.927px] font-normal leading-[normal]'>
            <Link href="/">Honeypot Finance</Link>
          </p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuList.map((m) => (
          <NavbarItem
            key={m.title}
            isActive={router.pathname === m.path}
            className={cn(
              "flex items-center justify-center  px-5 py-2.5 text-base font-normal leading-[normal]",
              router.pathname === m.path
                ? router.pathname === "/launch"
                  ? "font-bold"
                  : " [background:#271A0C] border-[color:var(--button-stroke,rgba(247,147,26,0.20))] border rounded-[100px] border-solid"
                : "hover:opacity-100 opacity-60"
            )}
          >
            <Link href={m.path}>{m.title}</Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end">
        {/* <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem> */}
        <WalletConnect></WalletConnect>
      </NavbarContent>
      <NavbarMenu>
        {menuList.map((m, index) => (
          <NavbarMenuItem
            key={m.title}
            className={cn(
              "p-[8px]",
              router.pathname === m.path
                ? "[background:rgba(225,138,32,0.40)] border-2 border-solid border-[rgba(225,138,32,0.60)]"
                : ""
            )}
            isActive={router.pathname === m.path}
          >
            <Link className={cn("w-full inline-block")} href={m.path}>
              {m.title}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem className="mt-[24px]">
          <WalletConnectMobile></WalletConnectMobile>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
};
