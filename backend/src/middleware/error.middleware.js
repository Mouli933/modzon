export function notFound(request, response) {
  response.status(404).json({
    success: false,
    message: 'The requested resource was not found.',
  });
}

export function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  if (error.code === '23505') {
    return response.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
  }

  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({
      success: false,
      message: 'Invalid JSON request body.',
    });
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  const message = status >= 500
    ? 'An unexpected server error occurred.'
    : error.message;

  if (status >= 500) {
    console.error('Unhandled API error:', error.name, error.code || '');
  }

  return response.status(status).json({ success: false, message });
}
