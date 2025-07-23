/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTENTFUL_SPACE_ID: string
  readonly VITE_CONTENTFUL_MANAGEMENT_TOKEN: string
  readonly VITE_CONTENTFUL_ENVIRONMENT: string
  readonly VITE_CONTENTFUL_APP_ID: string
  readonly VITE_PREVIEW_URL: string
  readonly VITE_DEV_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}