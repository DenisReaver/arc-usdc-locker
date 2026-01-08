"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { injectedWallet, metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";

const arcTestnet = {
  id: 5042002,
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

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!;

const config = getDefaultConfig({
  appName: "ARC USDC Locker",
  projectId,
  chains: [arcTestnet],
  ssr: true,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        injectedWallet({ chains: [arcTestnet] }), // Прямой попап MetaMask extension (приоритет)
        metaMaskWallet({ projectId, chains: [arcTestnet] }),
        walletConnectWallet({ projectId, chains: [arcTestnet] }),
      ],
    },
  ],
});

const queryClient = new QueryClient();

export function WagmiProviders({ children }: { children: React.ReactNode }) {
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
