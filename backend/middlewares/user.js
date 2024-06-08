const { userSignUpSchema, userSignInSchema, updateUserInfoSchema } = require("../zodschemas/userSchemas");

const validateUserSignUpInputs = (req, res, next) => {
  try {
    userSignUpSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid inputs!', errorData: error });
  }
}

const validateUserSignInInputs = (req, res, next) => {
  try {
    userSignInSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid inputs or Username/password are missing!', error });
  }
}

const validateUpdateUserInputs = (req, res, next) => {
  try {
    updateUserInfoSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid inputs!', error });
  }
}

module.exports = {
  validateUserSignUpInputs,
  validateUserSignInInputs,
  validateUpdateUserInputs
};
