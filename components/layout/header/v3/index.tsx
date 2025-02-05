import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/tailwindcss";
import { useRouter } from "next/router";
import { IoClose } from "react-icons/io5";
import { CustomNavbar } from "./components/Navbar";
import { Navbar, NavbarContent } from "@nextui-org/react";
import React, { HtmlHTMLAttributes, useState } from "react";
import { WalletConnect } from "@/components/walletconnect/v3";
import { Menu, appPathsList as menuList } from "@/config/allAppPath";
import { DOMAIN_MAP } from "honeypot-sdk";

export const Header = (props: HtmlHTMLAttributes<any>) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const listToNavbarItem = (list: Menu[], isSub?: boolean): React.ReactNode => {
    return list.map((m) =>
      m.path instanceof Array ? (
        <div key={m.title} className="w-full">
          <div
            className={cn(
              "p-3 text-white text-lg font-medium w-full",
              m.path.some((p) => router.pathname.includes(p.path))
                ? "bg-[rgba(225,138,32,0.40)] border-2 border-solid border-[rgba(225,138,32,0.60)] rounded-lg"
                : "",
              isSub ? "pl-8" : ""
            )}
            onClick={() => setIsMenuOpen(false)}
          >
            {m.title}
          </div>
          {listToNavbarItem(m.path as Menu[], true)}
        </div>
      ) : (
        <Link
          key={m.title}
          href={m.path as string}
          className={cn(
            "block p-3 text-white text-lg font-medium w-full",
            router.pathname === m.path
              ? "bg-[rgba(225,74,32,0.40)] border-2 border-solid border-[rgba(225,74,32,0.6)] rounded-lg"
              : "",
            isSub ? "pl-8" : ""
          )}
          onClick={() => setIsMenuOpen(false)}
        >
          {m.title}
        </Link>
      )
    );
  };

  return (
    <>
      <div className={clsx("relative mb-5", props.className)}>
        <Navbar
          classNames={{
            wrapper:
              "xl:max-w-[1200px] 2xl:max-w-[1500px] !px-0 !h-auto items-start ",
            base: "bg-transparent",
          }}
          className="bg-transparent"
          style={{
            backdropFilter: "none",
          }}
        >
          <NavbarContent
            className="hidden sm:flex gap-4 items-start"
            justify="start"
          >
            <CustomNavbar menuList={menuList} />
          </NavbarContent>

          <NavbarContent className="flex gap-4 items-start" justify="center">
            <Link
              href={DOMAIN_MAP.LANDING}
              className="pointer-events-none md:pointer-events-auto cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Image
                src="/images/header/project-name.svg"
                alt="Honeypot Finance"
                width={200}
                height={100}
                className={cn("w-[200px]", isMenuOpen ? "sm:block hidden" : "")}
              />
            </Link>
          </NavbarContent>

          <NavbarContent className="flex gap-4" justify="end">
            {!isMenuOpen && <WalletConnect />}
          </NavbarContent>
        </Navbar>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "sm:hidden fixed inset-0 z-[1000] transition-opacity duration-300",
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMenuOpen(false)}
        />
        <div
          className={cn(
            "fixed inset-x-0 top-[80px] bottom-0 bg-[#1A1A1A]/90 backdrop-blur-md overflow-y-auto border-t border-[#FFCD4D]/30 transition-all duration-300 ease-out pt-10",
            isMenuOpen ? "translate-y-0" : "translate-y-4 opacity-0"
          )}
        >
          <button
            onClick={() => setIsMenuOpen(false)}
            className="fixed right-4 top-2 p-2 rounded-full bg-[#FFCD4D]/20 hover:bg-[#FFCD4D]/30 transition-colors duration-200 z-[1001]"
          >
            <IoClose size={24} className="text-[#FFCD4D]" />
          </button>
          <div className="p-4 space-y-2">{listToNavbarItem(menuList)}</div>
        </div>
      </div>

      {isMenuOpen && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
    </>
  );
};
