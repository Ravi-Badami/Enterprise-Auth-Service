const userRepo = require('../user/user.repo');
const authRepo=require('./auth.repo');
const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');

exports.registerUser = async (userData) => {
  const { email, password, ...rest } = userData;
  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }
  const existingUser = await userRepo.findUserByEmail(email);
  if (existingUser) {
    throw ApiError.conflict("Email already taken");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userToCreate = {
    email,
    password: hashedPassword,
    ...rest
  };
  const user = await authRepo.registerUser(userToCreate);
  const { password: _, ...safeUser } = user.toObject ? user.toObject() : user;
  return safeUser;
};