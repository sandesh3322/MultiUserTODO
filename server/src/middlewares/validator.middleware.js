const bodyValidator = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const detail = {};
        error.details.forEach(err => {
          detail[err.path.join('.')] = err.message;
        });
        return next({ status: 400, message: "Validation failed", detail });
      }

      req.body = value; // sanitized
      next();
    } catch (ex) {
      console.error("Unexpected validator error:", ex);
      next(ex);
    }
  };
};

module.exports = { bodyValidator };
