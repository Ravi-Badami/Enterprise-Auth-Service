const asyncHandler = require('../../utils/asyncHandler');
const authService=require('./auth.service');

exports.registerUser=asyncHandler( async(req,res)=>{
const registerUser=await authService.registerUser(req.body);
res.status(200).send(registerUser);
});
