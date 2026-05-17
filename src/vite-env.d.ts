/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_PAYSTACK_PUBLIC_KEY: string;
    readonly VITE_GOOGLE_PLACES_API_KEY: string;
    readonly VITE_ENV: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
