import "vite/client";

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}

declare global {
  const __PLATFORM__: "web" | "desktop";

  interface Window {
    readonly __TAURI__: {
      readonly http: {
        readonly fetch: typeof fetch;
      };
      readonly opener: {
        readonly openUrl: (
          url: string | URL,
          openWith?: "inAppBrowser" | string
        ) => Promise<void>;
      };
      readonly deepLink: {
        readonly getCurrent: () => Promise<Array<string> | null>;
        readonly onOpenUrl: (
          handler: (urls: Array<string>) => void
        ) => Promise<() => void>;
      };
    };
  }

  interface ImportMetaEnv {
    readonly VITE_BACKEND_URL: string;
    readonly VITE_ELECTRIC_PROXY_URL: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
