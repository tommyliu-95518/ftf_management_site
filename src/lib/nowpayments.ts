import type { PaddlePlanId } from "@/lib/paddle";

export type CryptoChainId = "btc" | "eth" | "sol" | "trx" | "bnb";

export type CryptoChain = {
  id: CryptoChainId;
  name: string;
  ticker: string;
  payCurrency: string;
};

export const CRYPTO_CHAINS: Record<CryptoChainId, CryptoChain> = {
  btc: { id: "btc", name: "Bitcoin", ticker: "BTC", payCurrency: "btc" },
  eth: { id: "eth", name: "Ethereum", ticker: "ETH", payCurrency: "eth" },
  sol: { id: "sol", name: "Solana", ticker: "SOL", payCurrency: "sol" },
  trx: { id: "trx", name: "Tron", ticker: "TRX", payCurrency: "trx" },
  bnb: { id: "bnb", name: "BNB", ticker: "BNB", payCurrency: "bnb" },
};

export const CRYPTO_CHAIN_LIST = Object.values(CRYPTO_CHAINS);

export const SANDBOX_CRYPTO_CHAIN_LIST = [CRYPTO_CHAINS.btc];

export const CRYPTO_PLAN_PRICES_USD: Record<PaddlePlanId, number> = {
  pro_monthly: 8.99,
  pro_yearly: 49.9,
};

export function isCryptoChainId(value: string): value is CryptoChainId {
  return value in CRYPTO_CHAINS;
}
