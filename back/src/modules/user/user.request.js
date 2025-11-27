const Joi = require("joi");

const UserCreateDTO = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        "string.empty": "Name field cannot be empty",
        "string.min": "Name should be at least 2 characters",
        "string.max": "Name should be at most 50 characters",
    }),
    email: Joi.string().email().required().messages({
        "string.email": "Email must be of valid format",
        "string.empty": "Email cannot be empty",
    }),
    password: Joi.string().min(8).max(25).required().messages({
        "string.min": "Password should be at least 8 characters",
        "string.max": "Password should be at most 25 characters",
        "string.empty": "Password cannot be empty",
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        "any.only": "Password and confirm password should match",
        "string.empty": "Confirm password cannot be empty",
    }),
    role: Joi.string().valid("user").required().messages({
        "any.only": "Role must be 'user'. Admin role cannot be set by a regular user",
        "string.empty": "Role cannot be empty",
    }),
});

module.exports = {
    UserCreateDTO
};
