/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_URL_SHORTENER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
