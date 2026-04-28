const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Project validation schemas
const projectSchema = Joi.object({
  name: Joi.string().min(1).max(255).required()
});

// Time entry validation schemas
const timeEntrySchema = Joi.object({
  project_id: Joi.number().integer().positive().required(),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().required(),
  duration: Joi.number().integer().min(0).required(),
  notes: Joi.string().max(1000).allow('')
});

module.exports = {
  registerSchema,
  loginSchema,
  projectSchema,
  timeEntrySchema
};