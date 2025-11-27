const bodyValidator = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate request body using the provided Joi schema
            await schema.validateAsync(req.body, { abortEarly: false });
            next(); // pass to next middleware/controller if valid
        } catch (exception) {
            // Collect Joi validation errors into a simple object
            const detail = {};
            if (exception.details) {
                exception.details.forEach((error) => {
                    detail[error.path[0]] = error.message;
                });
            }

            // Pass the error to the error-handling middleware
            next({ status: 400, detail });
        }
    };
};

module.exports = {
    bodyValidator
};
