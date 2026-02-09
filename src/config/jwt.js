module.exports = {
  secret: process.env.JWT_SECRET,
  accessExpire: process.env.JWT_EXPIRE || '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};
