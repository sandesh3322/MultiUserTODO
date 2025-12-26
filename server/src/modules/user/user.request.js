const Joi = require("joi");

const UserCreateDTO = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
        "string.empty": "Name field cannot be empty",
        "string.min": "Name should be at least 2 characters",
        "string.max": "Name should be at most 50 characters",
    }),
    email: Joi.string().trim().email().required().messages({
        "string.email": "Email must be of valid format",
        "string.empty": "Email cannot be empty",
    }),
    password: Joi.string().trim().min(8).max(25).required().messages({
        "string.min": "Password should be at least 8 characters",
        "string.max": "Password should be at most 25 characters",
        "string.empty": "Password cannot be empty",
    }),
    confirmPassword: Joi.string().trim()
        .required()
        .equal(Joi.ref('password'))
        .messages({
            "any.only": "Password and confirm password should match",
            "string.empty": "Confirm password cannot be empty"
        })
});

module.exports = {
    UserCreateDTO
};
