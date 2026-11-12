import Joi from 'joi';

const VALID_BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const VALID_URGENCY_LEVELS = ['CRITICAL', 'URGENT', 'SCHEDULED'];
const VALID_RESPONDER_STATUSES = ['EN_ROUTE', 'ARRIVED', 'DONATED', 'WITHDRAWN'];
const VALID_REQUEST_STATUSES = ['FULFILLED', 'CANCELLED'];

export const createRequestSchema = Joi.object({
  patientName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Patient name is required',
      'string.min': 'Patient name must be at least 2 characters',
      'any.required': 'Patient name is required',
    }),

  bloodGroup: Joi.string()
    .valid(...VALID_BLOOD_GROUPS)
    .required()
    .messages({
      'any.only': `Blood group must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`,
      'any.required': 'Blood group is required',
    }),

  unitsNeeded: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .default(1)
    .messages({
      'number.min': 'Must request at least 1 unit of blood',
      'number.max': 'Cannot request more than 10 units at once',
    }),

  urgencyLevel: Joi.string()
    .valid(...VALID_URGENCY_LEVELS)
    .default('CRITICAL')
    .messages({
      'any.only': `Urgency level must be one of: ${VALID_URGENCY_LEVELS.join(', ')}`,
    }),

  hospitalName: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required()
    .messages({
      'string.empty': 'Hospital name is required',
      'any.required': 'Hospital name is required',
    }),

  hospitalAddress: Joi.string()
    .trim()
    .min(3)
    .max(250)
    .required()
    .messages({
      'string.empty': 'Hospital address is required',
      'any.required': 'Hospital address is required',
    }),

  hospitalLat: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.base': 'Hospital latitude must be a valid number',
      'number.min': 'Hospital latitude must be between -90 and 90',
      'number.max': 'Hospital latitude must be between -90 and 90',
      'any.required': 'Hospital latitude is required',
    }),

  hospitalLng: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.base': 'Hospital longitude must be a valid number',
      'number.min': 'Hospital longitude must be between -180 and 180',
      'number.max': 'Hospital longitude must be between -180 and 180',
      'any.required': 'Hospital longitude is required',
    }),

  expiresInHours: Joi.number()
    .min(1)
    .max(72)
    .default(12),
});

export const respondSchema = Joi.object({
  lat: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.base': 'Latitude must be a valid number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Current latitude is required upon confirmation',
    }),

  lng: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.base': 'Longitude must be a valid number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Current longitude is required upon confirmation',
    }),
});

export const responderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...VALID_RESPONDER_STATUSES)
    .required()
    .messages({
      'any.only': `Status must be one of: ${VALID_RESPONDER_STATUSES.join(', ')}`,
      'any.required': 'Status is required',
    }),
});

export const requestStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...VALID_REQUEST_STATUSES)
    .required()
    .messages({
      'any.only': `Status must be one of: ${VALID_REQUEST_STATUSES.join(', ')}`,
      'any.required': 'Status is required',
    }),
});

