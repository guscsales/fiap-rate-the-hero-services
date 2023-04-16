import { APIGatewayProxyEventHeaders } from 'aws-lambda';

export function getAuthorizationHeaders(headers: APIGatewayProxyEventHeaders) {
  const token = (headers['authorization'] || '').replace(
    'Bearer ',
    '',
  ) as string;

  return { token };
}
