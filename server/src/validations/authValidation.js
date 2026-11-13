import Joi from 'joi';

const VALID_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const registerSchema = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(2)
    .max(80)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters',
      'string.max': 'Full name cannot exceed 80 characters',
      'any.required': 'Full name is required',
    }),

  phone: Joi.string()
    .trim()
    .min(10)
    .max(16)
    .pattern(/^[+]?[0-9\s\-]+$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must contain only numbers and optional leading +',
      'string.min': 'Phone number must be at least 10 digits',
      'any.required': 'Phone number is required',
    }),

  email: Joi.string()
    .trim()
    .email()
    .lowercase()
    .optional()
    .allow('', null)
    .messages({
      'string.email': 'Please provide a valid email address',
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),

  bloodGroup: Joi.string()
    .valid(...VALID_BLOOD_GROUPS)
    .required()
    .messages({
      'any.only': `Blood group must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`,
      'any.required': 'Blood group is required at registration',
    }),
});

export const loginSchema = Joi.object({
  phone: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

export const readinessSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(80).optional(),
  email: Joi.string().trim().email().lowercase().allow('', null).optional(),
  isAvailableToDonate: Joi.boolean().optional(),
  lastDonatedAt: Joi.alternatives().try(Joi.date().iso(), Joi.string().valid('', null), Joi.allow(null)).optional(),
  fcmToken: Joi.string().trim().allow(null, '').optional(),
});

