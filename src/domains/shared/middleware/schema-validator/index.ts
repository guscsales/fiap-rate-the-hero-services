import { BaseSchema } from 'yup';

export const schemaValidator = (schema: {
  body?: BaseSchema;
  queryString?: BaseSchema;
}) => {
  const before = async (request) => {
    try {
      const { pathParameters, body, queryStringParameters } = request.event;

      if (schema.body) {
        schema.body.validateSync({
          ...pathParameters,
          ...queryStringParameters,
          ...body,
        });
      }

      return Promise.resolve();
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: e.errors[0],
          errors: e.errors,
        }),
      };
    }
  };

  return {
    before,
  };
};
