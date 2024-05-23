const zod = require("zod");

const userSignUpSchema = zod.object({
  username: zod.string().email("Invalid email format"),
  password: zod
    .string()
    .min(10, "Password must be at least 10 characters long")
    .refine((password) => /[A-Z]/.test(password), {
      message: "Password must contain at least one capital letter",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "Password must contain at least one small letter",
    })
    .refine((password) => /[\W_]/.test(password), {
      message: "Password must contain at least one special character",
    }),
  firstName: zod.string().min(1, { message: 'firstname is required' }),
  lastName: zod.string().min(1, { message: 'lastname is required' }),
});

const userSignInSchema = zod.object({
  username: zod.string().email("Invalid email format"),
  password: zod.string(),
})

module.exports = {
  userSignUpSchema,
  userSignInSchema,
};