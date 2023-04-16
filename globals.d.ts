declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      AUTHENTICATION_SECRET: string;
      SUPER_HERO_API_BASE_URL: string;
    }
  }
}

export {};
