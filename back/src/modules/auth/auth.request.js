const Joi = require("joi");

const LoginDTO = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Email must be a valid format",
        "string.empty": "Email is required"
    }),
    password: Joi.string().required().messages({
        "string.empty": "Password is required"
    })
});

module.exports = LoginDTO;
