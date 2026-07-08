// Render the custom 404 page when a route cannot be found.
const notFound = (req, res, next) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    layout: 'layouts/auth'
  });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = err.message || 'Something went wrong on our end';

  if (req.accepts('html')) {
    return res.status(status).render('errors/500', {
      title: 'Server Error',
      message,
      layout: status === 404 ? 'layouts/auth' : 'layouts/admin'
    });
  }

  res.status(status).json({ success: false, message });
};

module.exports = { notFound, errorHandler };
