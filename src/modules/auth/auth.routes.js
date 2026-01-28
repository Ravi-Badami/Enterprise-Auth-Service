const express=require('express');
const authController=require("./auth.controller");
const strictLimiter = require('../../middlewares/strictLimiter.middleware');
const validate = require('../../middlewares/validate.middleware');
const { createUserSchema } = require('../user/user.validation');
const router=express.Router();

router.post('/auth/register', strictLimiter, validate(createUserSchema), authController.registerUser);
module.exports=router;