const userRepo = require('../user/user.repo');
const authRepo=require('./auth.repo');
const jwtUtils=require('../../utils/jwt.utils');
const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');


exports.loginUser = async (userData) => {
  const { email, password } = userData;
  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }

  const userWithPassword = await authRepo.findUserByEmailWithPassword(email);
  if (!userWithPassword) {
    throw ApiError.notFound("Invalid email or pass");
  }

  const isMatch = await bcrypt.compare(password, userWithPassword.password);
  if (!isMatch) {
    throw ApiError.notFound("Invalid email or pass");
  }

  const accessToken=jwtUtils.generateAccessToken(userWithPassword.id,userWithPassword.role);

  const refreshToken=jwtUtils.generateRefreshToken(userWithPassword.id);

  await authRepo.saveRefreshToken(userWithPassword.id,refreshToken);
   return { 
    accessToken, 
    refreshToken,
    user: {
        id: userWithPassword._id, 
        email: userWithPassword.email,
        role: userWithPassword.role
    }
  };
}

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