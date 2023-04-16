import cors from '@middy/http-cors';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';
import { tokenValidator } from '@domains/shared/middleware/token-validator';

type Options = {
  requireTokenValidator?: boolean;
};

const defaultOptions: Options = {
  requireTokenValidator: true,
};

export const coreMiddleware = (options: Options = {}) => {
  const { requireTokenValidator } = {
    ...defaultOptions,
    ...options,
  };

  return [
    httpHeaderNormalizer(),
    jsonBodyParser(),
    cors({
      origin: '*',
    }),
    ...(requireTokenValidator ? [tokenValidator()] : []),
  ];
};
