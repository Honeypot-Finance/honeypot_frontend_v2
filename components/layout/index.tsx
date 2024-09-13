import { useEffect } from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import { useRouter } from "next/router";
import { useAccount, useConnectorClient } from "wagmi";
import { wallet } from "@/services/wallet";
import { config } from "@/config/wagmi";
import { networksMap } from "@/services/chain";
import LaunchHeader from "./LaunchHeader";
import { cn } from "@/lib/tailwindcss";
import NotConnetctedDisplay from "../NotConnetctedDisplay/NotConnetctedDisplay";
import ConfettiComponent from "../atoms/Confetti/Confetti";
import PopOverModal from "../PopOverModal/PopOverModal";
import { trpcClient } from "@/lib/trpc";
import { popmodal } from "@/services/popmodal";
import Link from "next/link";
import { metadata } from "@/config/metadata";

export const Layout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  const { chainId } = useAccount();
  const currentChain = chainId ? networksMap[chainId] : null;

  useEffect(() => {
    trpcClient.metadata.getServerMetadata.query().then((res) => {
      if (res.latest_version === metadata.version || process.env.NODE_ENV === 'development' ) return;
      popmodal.openModal({
        content: (
          <div className="min-h-[300px] line-[24px]">
            <p className="text-center  font-bold text-[30px]">Announcement</p>
            <h1 className="mt-[24px]">This version is outdated, please check our newest link:&nbsp;    <a
                className="hover:text-orange-500 transition-all underline"
                href={res.latest_site}
              >
                {res.latest_site}.
              </a></h1>
              <p>
                Meanwhile, please migrate your assets to our new version
              </p>

          </div>
        ),
      });
    });
  }, []);

  return (
    <div className={cn("flex flex-col min-h-screen overflow-auto", className)}>
      <ConfettiComponent />
      <PopOverModal />
      {router.pathname.startsWith("/launch") ||
      router.pathname.startsWith("/pools") ? (
        <LaunchHeader />
      ) : (
        <Header />
      )}
      {currentChain ? (
        <div className=" px-[12px] sm:pt-[72px] pt-[24px] flex-1">
          {children}
        </div>
      ) : (
        <NotConnetctedDisplay />
      )}
      {/* <Footer></Footer> */}
    </div>
  );
};
