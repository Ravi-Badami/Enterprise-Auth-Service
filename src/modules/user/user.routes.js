const express=require("express");
const router=express.Router();
const userController=require('./user.controller');

const validate=require('../../middlewares/validate.middleware')
const {userIdSchema}=require('./user.validation');

router.get('/',userController.getUsers);
router.get('/:id',validate(userIdSchema),userController.getUser);

router.delete('/:id',validate(userIdSchema),userController.deleteUser);

module.exports=router;