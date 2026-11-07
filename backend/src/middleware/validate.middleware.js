export function validate(schema, property = 'body') {
  return (request, response, next) => {
    const result = schema.safeParse(request[property]);
    if (!result.success) {
      return response.status(400).json({
        success: false,
        message: result.error.issues[0]?.message || 'Invalid request.',
      });
    }

    request[property] = result.data;
    return next();
  };
}
