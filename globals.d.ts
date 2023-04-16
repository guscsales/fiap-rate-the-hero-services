declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      AUTHENTICATION_SECRET: string;
    }
  }
}

export {};
