export function errorHandler(err, req, res, _next) { // eslint-disable-line
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
}