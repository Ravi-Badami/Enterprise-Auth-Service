const ApiError = require('../utils/ApiError');
const apiError=require('../utils/ApiError');

const requestTimeout=(timeoutMs)=>(req,res,next)=>{
  req.setTimeout(() => {
   const error=ApiError.requestTimeout(`Request timed out after ${timeoutMs}ms`)

       next(error);
  });


  res.setTimeout(timeoutMs);
  next();
};
module.exports=requestTimeout;