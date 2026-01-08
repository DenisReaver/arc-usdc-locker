"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { useState, useEffect } from "react";

const arcTestnet = {
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID),
  name: "ARC Testnet",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
} as const;

const queryClient = new QueryClient();

export function WagmiProviders({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(() => 
    getDefaultConfig({
      appName: "arc lock",
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
      chains: [arcTestnet],
      ssr: true,
    })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#3b82f6",
            accentColorForeground: "#ffffff",
            borderRadius: "large",
            overlayBlur: "small",
          })}
          modalSize="compact"
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}