'use strict';

import Koa from 'koa';
import mount from 'koa-mount';
import auth from './routes/auth';
import responseTime from 'koa-response-time';
import bodyParser from 'koa-body';
import user from './routes/user';
import protectedRoutes from './routes/protected';



const app = new Koa();
const rootApp = new Koa();

app.use(responseTime());
app.use(bodyParser());



rootApp.use(function *(next){
  this.body = "Welcome to API server. You are tuned in and ready to go!";
  this.status = 200;
  yield next;
})

//API version v1
app.use(mount('/v1',rootApp));
app.use(mount('/v1/auth',auth));
app.use(mount('/v1/user',user));
app.use(mount('/v1/protected',protectedRoutes));

export default app

if (!module.parent) app.listen(3000,()=>{
  console.log("Beep beep bloop, call me on port 3000");
});
