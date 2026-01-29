const jwt=require("jsonwebtoken");
const jwtConfig=require("../config/jwt");
exports.generateAccessToken=(userId,role)=>{
  return jwt.sign(
    {id:userId,role},
    jwtConfig.secret,
    {expiresIn:jwtConfig.accessExpire}
  );
};

exports.generateRefreshToken=(userId)=>{
return jwt.sign({id:userId},jwtConfig.refreshSecret,{expiresIn:jwtConfig.refreshExpire});
};

exports.verifyAccessToken=(token)=>{
  return jwt.verify(token,jwtConfig.secret);
};

exports.verifyRefreshToken=(token)=>{
  return jwt.verify(token,jwtConfig.refreshSecret);
};