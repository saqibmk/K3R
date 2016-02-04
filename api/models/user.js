'use strict'
//import bcrypt from 'co-bcrypt';
import bcrypt from 'bcrypt';


const thinky = require('thinky')();

const type = thinky.type;
const r = thinky.r;

const user = thinky.createModel('User',{
  id: type.string(),
  email: type.string().email().required(),
  password: type.string().required(),
  firstName: type.string().required(),
  lastName: type.string().required(),
  active: type.boolean().default(false)
});


user.define('encryptPassword',function(){
  const password = this.password;
  const hashedPassword = bcrypt.hashSync(password,bcrypt.genSaltSync(10));
  this.password = hashedPassword;
  return this;
})

user.comparePassword = function *(user,password){
  return bcrypt.compareSync(password,user.password);
}


user.ensureIndex("email");

export default user
