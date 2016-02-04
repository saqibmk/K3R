/*
Using send-grid for emails. Email are sent on registration for verification.
Nothing fancy, but you can make it one"
*/


import crypto from 'crypto';
import {options} from '../config/email';

import nodemailer from 'nodemailer';
import mTransport from 'nodemailer-sendgrid-transport';


const mailer = nodemailer.createTransport(mTransport(options));

export function *genVerificationToken(){
  var token = crypto.randomBytes(20)
  token = token.toString('hex');
  return token;
}

export function *genEmailLink(token){
  return 'localhost:3000/v1/user/verify/token?=' + token;
}

export function *sendEmail(add,link){

  var email = {
    to: add,
    from: 'welcome@example.com',
    subject: 'User confirmation email',
    text: link
  }

  let reply = yield mailer.sendMail(email);
  //let reply = {message:'success'};
  return reply;

}
