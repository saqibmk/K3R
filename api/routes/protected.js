//Example of a protected route

'use strict'

import Koa from 'koa';
import Router from 'koa-router';
import jwt from 'koa-jwt';
import authenticator from '../utils/auth';

const app = Koa();
const router = Router();

app.use(authenticator);
app.use(jwt({secret:'yourawesomesecret'}))

router.get('/',function*(next){

  this.body = "This is a protected route";
  this.status = 200;

})

app.use(router.routes());

export default app
