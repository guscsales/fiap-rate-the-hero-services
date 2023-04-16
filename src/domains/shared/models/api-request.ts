import { APIGatewayProxyEvent } from 'aws-lambda';

export interface ApiRequest<T = null>
  extends Omit<APIGatewayProxyEvent, 'body'> {
  body: T;
}
