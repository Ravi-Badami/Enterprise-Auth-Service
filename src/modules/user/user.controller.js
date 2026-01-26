
const userService=require("./user.service");

exports.getAllUsers=async(req,res,next)=>{
  try{
const users=await userService.getAllUsers();
res.send(users);
  }
  catch(error){
    next(error);
  }
};

exports.createNewUser=async(req,res,next)=>{
  try {
    const newUser=await userService.createUser(req.body);
    res.send(newUser);
  } catch (error) {
    next(error)
  }
};

exports.deleteUser=async(req,res,next)=>{
  try {
    const deleteUser=await userService.deleteUser(req.params.id);
    res.send(deleteUser);
  } catch (error) {
    next(error);
  }
}

