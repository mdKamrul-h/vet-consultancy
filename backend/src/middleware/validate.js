'use strict';

const { validationResult } = require('express-validator');

/**
 * Runs express-validator checks and returns a 422 with all validation errors
 * if any check failed; otherwise calls next().
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { validate };
