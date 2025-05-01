const InvariantError = require('../../exceptions/InvariantError');
const { registerSchema, loginSchema, userGroupSchema, messagesSchema } = require('./schema');


const ChaatingValidator = {
  validateRegister: (payload) => {
    const { error, value } = registerSchema.validate(payload, { abortEarly: false });

    if (error) {
      throw new InvariantError(error.details.map((err) => err.message).join(', '));
    }
    return value;
  },
  validateLogin: (payload) => {
    const validationResult = loginSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateUserGroup: (payload) => {
    const validationResult = userGroupSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateMessages: (payload) => {
    const validationResult = messagesSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ChaatingValidator;