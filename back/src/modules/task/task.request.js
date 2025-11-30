const Joi = require("joi");

// DTO for creating a new task
const TaskCreateDTO = Joi.object({
  title: Joi.string()
    .max(100)
    .required()
    .messages({
      "string.base": "Title must be a string",
      "string.empty": "Title is required",
      "string.max": "Title cannot exceed 100 characters",
      "any.required": "Title is required"
    }),
  description: Joi.string()
    .max(500)
    .allow("") // optional
    .messages({
      "string.base": "Description must be a string",
      "string.max": "Description cannot exceed 500 characters",
    }),
  status: Joi.string()
    .valid("PENDING", "IN_PROGRESS", "COMPLETED")
    .default("PENDING")
    .messages({
      "any.only": "Status must be PENDING, IN_PROGRESS or COMPLETED"
    }),
  dueDate: Joi.date()
    .optional()
    .messages({
      "date.base": "Due date must be a valid date"
    }),
  priority: Joi.string()
    .valid("LOW", "MEDIUM", "HIGH")
    .default("MEDIUM")
    .messages({
      "any.only": "Priority must be LOW, MEDIUM, or HIGH"
    }),
  userId: Joi.string()
    .required()
    .messages({
      "any.required": "User ID is required",
      "string.base": "User ID must be a string"
    })
});

module.exports = {
  TaskCreateDTO
};
