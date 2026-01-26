const repo = require('./user.repo');
const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');

exports.getAllUsers = async () => {
  return repo.findAllUsers();
};

exports.createUser = async (userData) => {
  const { email, password, ...rest } = userData;
  if (!email || !password) {
    throw ApiError.badRequest("Email and password are required");
  }
  const existingUser = await repo.findUserByEmail(email);
  if (existingUser) {
    throw ApiError.conflict("Email already taken");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const userToCreate = {
    email,
    password: hashedPassword,
    ...rest
  };
  const user = await repo.addUsers(userToCreate);
  const { password: _, ...safeUser } = user.toObject ? user.toObject() : user;
  return safeUser;
};

exports.deleteUser=async(id)=>{
  const deletedUser=await repo.deleteUser(id);
  return deletedUser;
}