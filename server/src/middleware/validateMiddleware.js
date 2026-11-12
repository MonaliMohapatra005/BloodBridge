/**
 * Middleware factory for validating incoming request bodies against a Joi schema.
 * @param {import('joi').ObjectSchema} schema - The Joi schema to validate against
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors, not just the first
      stripUnknown: true, // Remove keys not specified in schema
    });

    if (error) {
      const errorMessages = error.details.map((detail) =>
        detail.message.replace(/\"/g, "'")
      );

      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errorMessages,
      });
    }

    // Replace req.body with the sanitized and coerced value
    req.body = value;
    next();
  };
};

