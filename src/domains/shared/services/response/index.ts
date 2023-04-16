import { StatusCodes } from '@domains/shared/enums/status-codes';

export default function response(
  statusCode: StatusCodes = StatusCodes.OK,
  data: any = '',
) {
  return {
    statusCode,
    body: JSON.stringify(data.error ? { ...data, error: data.error } : data),
  };
}
