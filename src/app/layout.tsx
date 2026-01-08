import type { Metadata } from "next";
import { WagmiProviders } from "./wagmi-provider"; // Путь к твоему wagmi-provider.tsx

export const metadata: Metadata = {
  title: "arc token locker",
  description: "Блокировка USDC с прибавлением дней",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <WagmiProviders>{children}</WagmiProviders>
      </body>
    </html>
  );
}