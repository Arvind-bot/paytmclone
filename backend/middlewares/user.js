const { userSignUpSchema, userSignInSchema } = require("../zodschemas/userSchemas");

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

module.exports = {
  validateUserSignUpInputs,
  validateUserSignInInputs
};
