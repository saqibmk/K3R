import assert from 'assert';
import {genVerificationToken,genEmailLink,sendEmail} from '../../api/utils/email';


require('co-mocha');

describe('Email Tests',()=>{

  it('Should generate a random token',function*(){
    let token = yield genVerificationToken()
    assert.notEqual(token,null);
  })

  it('Should create a link with the token in it',function* (){

    let token = yield genVerificationToken()
    let confirmationLink = yield genEmailLink(token)

    assert.notEqual(confirmationLink,null);

  })

  it('Should send email to new user', function*(){

    let token = yield genVerificationToken()
    let confirmationLink = yield genEmailLink(token)
    let email = "saqib.mk@gmail.com";
    let response = yield sendEmail(email,confirmationLink);
    assert.equal(response.message, 'success');

  })


})
