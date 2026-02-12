/* Add these schemas */

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please include a valid email'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
  params: z.object({
    token: z.string().length(64, 'Invalid token'), // 64 chars hex
  }),
});
module.exports = {
  // ... existing exports ...
  forgotPasswordSchema,
  resetPasswordSchema
};