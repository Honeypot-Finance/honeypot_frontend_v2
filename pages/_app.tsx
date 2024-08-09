import "@/styles/globals.css";
import "@/styles/overrides/reactjs-popup.css";
//@ts-ignore
import type { AppProps } from "next/app";
import { Layout } from "@/components/layout";
import { NextLayoutPage } from "@/types/nextjs";
import { WagmiProvider, useWalletClient } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { NextUIProvider } from "@nextui-org/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { config } from "@/config/wagmi";
import { trpc, trpcQueryClient } from "../lib/trpc";
import { useEffect } from "react";
import { wallet } from "@/services/wallet";
import { DM_Sans } from "next/font/google";
import { Inspector } from 'react-dev-inspector'


const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400"] });
// enableStaticRendering(true)
const queryClient = new QueryClient();

const Provider = ({ children }: { children: React.ReactNode }) => {
  const { data: walletClient } = useWalletClient({
    config,
  });
  useEffect(() => {
    if (walletClient?.account) {
      wallet.initWallet(walletClient);
    }
  }, [walletClient]);
  return children;
};

export default function App({
  Component,
  pageProps,
}: AppProps & {
  Component: NextLayoutPage;
}) {
  const ComponentLayout = Component.Layout || Layout;
  return (
    <trpc.Provider client={trpcQueryClient} queryClient={queryClient}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <NextUIProvider>
              <Provider>
                <Inspector keys={['Ctrl', 'Shift', 'Z']}></Inspector>
                <ComponentLayout className={dmSans.className}>
                  <Component {...pageProps} />
                </ComponentLayout>
              </Provider>
              <ToastContainer></ToastContainer>
            </NextUIProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </trpc.Provider>
  );
}
