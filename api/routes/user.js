'use strict';

import Koa from 'koa';
import Router from 'koa-router';
import User from '../models/user';
import client from '../utils/redis';
import * as email from '../utils/email';

const app = Koa();
const router = Router();

router.post('/register',function*(next){

  try{
    let user = new User(this.request.body);
    user.active = false;
    let matched = yield User.filter({email:user.email})
    if(matched.length > 0) throw "Ooops"
    let result = yield user.encryptPassword().save();
    let token = yield email.genVerificationToken();
    yield client.hmset(token,"id",result.id,"type","register");
    yield client.expire(token,600);
    let link = yield email.genEmailLink(token);
    yield email.sendEmail(user.email,link);
    this.body = {Message:"Success"};
    this.status = 200;
  }
  catch(err){
    this.body = {Message:err}
    this.status = 500;
  }
  yield next;

})

router.get('/verify',function*(next){

  try{
    let token = this.request.query.token;
    let value = yield client.hgetall(token);
    if(!value) throw "Token expired";
    if(value.type !== "register") throw "Error"
    let user = yield User.get(value.id).update({active:true});
    this.body = {Message:"Success"};
    this.status = 200;
  }catch(err){
    console.log(err)
    this.body = {Message:err}
    this.status = 500;
  }
  yield next;
})

router.post('/reset',function*(next){

  try {

    let token = this.request.body.token;
    let newPassword = this.request.body.newPassword;

    if(!token || !newPassword) throw "Error";

    let redisRecord = yield client.hgetall(token);

    if(!redisRecord) throw "Fail!";
    if(redisRecord.type !== "reset") throw "Error";

    let user = new User({
      password: newPassword
    })

    let newUser = user.encryptPassword();
    let oldUser = yield User.get(redisRecord.id).update({password:newUser.password});


    this.body = {Message:"Success"};
    this.status = 200;



  } catch (e) {
    console.log(e)
    this.body = {Message:e}
    this.status = 500;

  }


})

router.get('/reset',function*(next){

  try {

    let userEmail = this.request.query.email;
    let user = yield User.filter({email:userEmail});
    if(user[0]){
      let token = yield email.genVerificationToken();
      yield client.hmset(token,"id",user.id,"type","reset");
      yield client.expire(token,600);
      let link = yield email.genEmailLink(token);
      yield email.sendEmail(user.email,link);
    }
    this.body = {Message:"Success"};
    this.status = 200;

  } catch (e) {
    console.log(e)
    this.body = {Message:e}
    this.status = 500;
  }

})


app.use(router.routes());


export default app
