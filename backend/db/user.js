const mongoose = require('mongoose');
const argon2 = require("argon2");

const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
  },
});

// Method to generate Hash from plain text  using argon2
userSchema.methods.createHash = async function(plainTextPassword) {
  // return password hash
  return await argon2.hash(plainTextPassword);
};

// Method to validate the entered password using argon2
userSchema.methods.validatePassword = async function(candidatePassword) {
  try {
    return await argon2.verify(this.password, candidatePassword)
  } catch (err) {
    throw new Error(err);
  }
};

// Create a model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
