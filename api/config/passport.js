"use strict";

import passport from 'koa-passport';
var LocalStrategy = require('passport-local').Strategy;
import co from 'co';
import User from '../models/user';
import bcrypt from 'bcrypt';

passport.use(new LocalStrategy(function(username,password,done){
  co(function*(){
    try{
      let user = yield User.filter({email:username,active:true});
      let matched = yield User.comparePassword(user[0],password);
      if(matched) return done(null,user[0]);
      throw "Authentication error"
    }catch(err){
      done(err,null)
    }
  })
}))
