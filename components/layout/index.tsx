/* eslint-disable @next/next/no-before-interactive-script-outside-document */
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { Header } from "./header/v3";
import { useRouter } from "next/router";
import { cn } from "@/lib/tailwindcss";
import ConfettiComponent from "../atoms/Confetti/Confetti";
import PopOverModal from "../PopOverModal/PopOverModal";
import { trpcClient } from "@/lib/trpc";
import { popmodal } from "@/services/popmodal";
import { metadata } from "@/config/metadata";
import AnnouncementBar from "./AnnouncementBar";
import Link from "next/link";
import ChatWidget from "../ServiceChat";
import { Footer } from "./footer";
import { chatService, questionTitles } from "@/services/chat";
import _ from "lodash";
import { notificationService } from "@/services/notification";
import { wallet } from "@/services/wallet";

export const Layout = observer(
  ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    const router = useRouter();

    useEffect(() => {
      if (!wallet.isInit) {
        return;
      }
      notificationService.checkClaimableProject();
      notificationService.checkRefundableProject();
    }, [wallet.isInit]);

    useEffect(() => {
      //if its user first time visit, open chat
      const questions = chatService.findRelatedQuestionsByPath(router.pathname);
      const pageVisited = window.localStorage.getItem(`pageVisited`);

      if (!pageVisited && questions) {
        chatService.clearChat();
        chatService.setChatIsOpen(true);
        chatService.agentMessage(
          chatService.getPresetQuestions()[questions[0] as questionTitles]
            .answer
        );
        window.localStorage.setItem(`pageVisited`, "true");
      }
    }, [router.pathname]);

    useEffect(() => {
      trpcClient.metadata.getServerMetadata.query().then((res) => {
        if (
          res.latest_version === metadata.version ||
          process.env.NODE_ENV === "development"
        )
          return;

        popmodal.openModal({
          content: (
            <div className="min-h-[300px] line-[24px]">
              <div className="text-center  font-bold text-[30px]">
                Announcement
              </div>
              <h1 className="mt-[24px]">
                This version is outdated, please check our newest link:&nbsp;{" "}
                <a
                  className="hover:text-orange-500 transition-all underline"
                  href={res.latest_site}
                >
                  {res.latest_site}.
                </a>
              </h1>
              <p>
                Pls have fun with brand new features with pot2pump meme launch.
                we will not update and maintain this version anymore so feel
                free to migrate your assets to our new version
              </p>
            </div>
          ),
        });
      });
    }, []);

    const slogans = [
      <>
        <Link
          href="https://pot2pump.honeypotfinance.xyz/launch-token?launchType=meme"
          className="flex items-center"
        >
          <span className="flex items-center justify-center gap-2">
            Launch a new meme token within 5 seconds 🚀
          </span>
        </Link>
      </>,
    ];

    return (
      <div
        className={cn(
          "flex flex-col min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[url('/images/icons/bg-honey.png')]",
          className
        )}
      >
        <AnnouncementBar slogans={slogans} interval={5000} />
        <ChatWidget />

        <ConfettiComponent />
        <PopOverModal />
        <Header />

        <div className="flex-1 flex">{children}</div>

        <Footer />
      </div>
    );
  }
);
