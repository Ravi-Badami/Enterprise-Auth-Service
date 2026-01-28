const User = require('../user/user.model')

exports.registerUser=async(data)=>{
 return await User.create(data);
}