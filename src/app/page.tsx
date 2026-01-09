"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseUnits, formatUnits } from "viem";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as `0x${string}`;
const USDC_DECIMALS = 6; // Правильно для ARC Testnet!

const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "additionalDays", type: "uint256" },
    ],
    name: "lock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unlock",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "lockedBalanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "unlockTimeOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const USDC_ABI = [
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function Home() {
  const { address, isConnected } = useAccount();

  // Все хуки wagmi — наверху, до любых условий
  const { data: rawFreeBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });
  const freeBalance = rawFreeBalance ? formatUnits(rawFreeBalance, USDC_DECIMALS) : "0";

  const { data: rawLocked } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "lockedBalanceOf",
    args: address ? [address] : undefined,
  });
  const lockedBalance = rawLocked ? formatUnits(rawLocked, USDC_DECIMALS) : "0";

  const { data: rawUnlockTime } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "unlockTimeOf",
    args: address ? [address] : undefined,
  });
  const unlockDate = rawUnlockTime && rawUnlockTime > BigInt(0)
    ? new Date(Number(rawUnlockTime) * 1000).toLocaleString("ru-RU")
    : null;

  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: lock, data: lockHash } = useWriteContract();
  const { writeContract: unlock } = useWriteContract();

  const { isLoading: approveLoading } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: lockLoading } = useWaitForTransactionReceipt({ hash: lockHash });

  // Защита от SSR ошибок wagmi/rainbowkit
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

const handleApprove = () => {
  if (!amount || Number(amount) <= 0) {
    alert("Введите сумму USDC больше 0");
    return;
  }

  if (!address) {
    alert("Кошелёк не подключён");
    return;
  }

  console.log("Approve: amount =", amount, "address =", address);

  const realAmount = parseUnits(amount, USDC_DECIMALS);

  console.log("Approve parsed amount =", realAmount.toString());

  approve({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "approve",
    args: [CONTRACT_ADDRESS, realAmount],
  });
};

  const handleLock = () => {
    if (!amount || !days) return;
    const realAmount = parseUnits(amount, USDC_DECIMALS);
    const additionalDays = BigInt(Number(days));
    lock({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "lock",
      args: [realAmount, additionalDays],
    });
  };

  const handleUnlock = () => {
    unlock({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "unlock",
    });
  };

  // Пока не на клиенте — показываем загрузку
  if (!isClient) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <h1 style={{ fontSize: "2.5rem", color: "#60a5fa" }}>Загрузка...</h1>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      color: "#e2e8f0",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "30px", color: "#60a5fa" }}>
        🔒 ARC USDC Locker
      </h1>

      {/* Кнопка подключения по центру */}
      <div style={{ marginBottom: "40px" }}>
        <ConnectButton />
      </div>

      {isConnected && address && (
        <div style={{
          background: "#1e293b",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          width: "100%",
          maxWidth: "500px",
          border: "1px solid #334155",
        }}>
          <p style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
            <strong>Адрес:</strong> {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          <p style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
            <strong>Свободный баланс:</strong> {parseFloat(freeBalance).toFixed(2)} USDC
          </p>
          <p style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
            <strong>Заблокировано:</strong> {parseFloat(lockedBalance).toFixed(2)} USDC
          </p>
          {unlockDate && (
            <p style={{ marginBottom: "25px", fontSize: "1.1rem", color: "#93c5fd" }}>
              <strong>Разблокировка:</strong> {unlockDate}
            </p>
          )}

          <h2 style={{ fontSize: "1.5rem", margin: "30px 0 20px", color: "#60a5fa" }}>
            Добавить в лок (дни прибавляются)
          </h2>

          <input
            type="number"
            placeholder="Сумма USDC (например: 10)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "15px",
              background: "#334155",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "1rem",
            }}
          />

          <input
            type="number"
            placeholder="Дни для прибавления (например: 7)"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "25px",
              background: "#334155",
              border: "1px solid #475569",
              borderRadius: "8px",
              color: "#e2e8f0",
              fontSize: "1rem",
            }}
          />

          <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
            <button
              onClick={handleApprove}
              disabled={approveLoading}
              style={{
                flex: 1,
                padding: "14px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              {approveLoading ? "Approving..." : "1. Approve USDC"}
            </button>

            <button
              onClick={handleLock}
              disabled={lockLoading}
              style={{
                flex: 1,
                padding: "14px",
                background: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              {lockLoading ? "Блокируется..." : "2. Заблокировать"}
            </button>
          </div>

          <button
            onClick={handleUnlock}
            style={{
              width: "100%",
              padding: "16px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            Разблокировать всё
          </button>
        </div>
      )}
    </div>
  );
}
