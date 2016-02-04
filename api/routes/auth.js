'use strict'

import Koa from 'koa';
import Router from 'koa-router';
import jwt from 'jsonwebtoken';

const passport = require('koa-passport');
require('../config/passport');

const app = Koa();
const router = Router();


app.use(passport.initialize());

router.get('/',function*(next){
  this.body = "Authentication Router";
  this.status = 501;
  yield next;
})

router.post('/login',function*(next){
  let user = this.request.body;

  var ctx = this
  yield passport.authenticate('local',function*(err,user,info){
    if(user){
      let token = jwt.sign(user , 'yourawesomesecret');
      ctx.body = {token:token};
      ctx.status = 202;
    }else{
      ctx.status = 401;
      ctx.body = {'Message':'Not Authorized'}
    }
  }).call(ctx,next);

})



app.use(router.routes());

export default app
