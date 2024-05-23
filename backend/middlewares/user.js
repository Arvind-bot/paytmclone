const { userSignUpSchema, userSignInSchema, updateUserInfoSchema } = require("../zodschemas/userSchemas");

function validateUserSignUpInputs(req, res, next) {
  try {
    userSignUpSchema.parse(req.body);
    next();
  } catch (error) {
    console.log({error});
    res.status(400).json({ success: false, message: 'Invalid inputs!' });
  }
}

function validateUserSignInInputs(req, res, next) {
  try {
    userSignInSchema.parse(req.body);
    next();
  } catch (error) {
    console.log({error});
    res.status(400).json({ success: false, message: 'Invalid inputs or Username/password are missing!' });
  }
}

function validateUpdateUserInputs(req, res, next) {
  try {
    updateUserInfoSchema.parse(req.body);
    next();
  } catch (error) {
    console.log({error});
    res.status(400).json({ success: false, message: 'Invalid inputs!' });
  }
}

module.exports = {
  validateUserSignUpInputs,
  validateUserSignInInputs,
  validateUpdateUserInputs
};
