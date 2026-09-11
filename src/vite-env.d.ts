/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PADDLE_CLIENT_TOKEN: string;
  readonly VITE_PADDLE_ENVIRONMENT: "sandbox" | "production";
  readonly VITE_PADDLE_PRICE_PRO_MONTHLY: string;
  readonly VITE_PADDLE_PRICE_PRO_YEARLY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
