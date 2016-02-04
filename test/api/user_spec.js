//User unit Tests
import assert from 'assert';
import User from '../../api/models/user';
import UserAPI from '../../api/routes/user';
import database from '../../api/config/database';
import request from 'supertest';
import app from '../../api/server';
import redis from '../../api/utils/redis';
import coRequest from 'co-supertest';

var should = require('chai').should();

const thinky = require('thinky')(database);

require('co-mocha');

describe('User Model Testing', ()=>{

  beforeEach(function *(){
    yield thinky.r.table('User')
                .delete()
                .run()
    yield redis.flushall()
  })

  it('should create a user', function *(){
    let user = new User({});
    assert.equal(typeof user, 'object');
  });

  it('should instanciate with properties', function*(){
    let email, firstName, lastName;
    email = "test@gmail.com"
    firstName = "First"
    lastName = "Last"

    let user = new User({
      email: email,
      firstName: firstName,
      lastName: lastName
    })

    assert.equal(user.email,email);
    assert.equal(user.firstName,firstName);
    assert.equal(user.lastName,lastName);
  })

  it('should be assigned an id after saving', function*(){
    let email, firstName, lastName, password;
    email = "test@gmail.com"
    firstName = "First"
    lastName = "Last"
    password = "password"

    let user = new User({
      email: email,
      password: password,
      firstName: firstName,
      lastName:lastName
    })

    yield user.save()
    assert(user.id)
  })

  it('should find user by email',function*(){
    let user, foundUser, firstName, lastName, email, password;

    email = "test@gmail.com"
    firstName = "First"
    lastName = "Last"
    password = "password"

    user = new User({
      email: email,
      password: password,
      firstName: firstName,
      lastName:lastName
    })

    yield user.save()


    foundUser = yield User.filter({email:email})

    assert.equal(foundUser[0].firstName,firstName);

  })

  it('Should set activate to false on new user creation',function*(){

    let user, newUser, firstName, lastName, email, password;

    email = "test@gmail.com"
    firstName = "First"
    lastName = "Last"
    password = "password"

    user = new User({
      email: email,
      password: password,
      firstName: firstName,
      lastName:lastName
    })


    newUser = yield user.save()
    assert.equal(newUser.active,false);


  })

  it('Should encrypt password for new registration', function*(){

    let user, newUser, firstName, lastName, email, password;

    email = "test@gmail.com"
    firstName = "First"
    lastName = "Last"
    password = "password"

    user = new User({
      email: email,
      password: password,
      firstName: firstName,
      lastName:lastName
    })

    newUser = yield user.encryptPassword().save()
    assert.notEqual(newUser.password,password);

  })

})

describe('User route API testing', ()=>{

  beforeEach(function *(){
    yield thinky.r.table('User')
                .delete()
                .run()
    yield redis.flushall()
  })

  it('Should register a new user', (done) =>{

    let user = new User({
      email: "email@example.com",
      firstName: "Test",
      lastName: "Last",
      password: "secret",
    })

    request(app.listen())
      .post('/v1/user/register')
      .send(user)
      .expect(200,done);
  })

  it('Should throw error if user cannot be created', (done)=>{

    let user = new User({})
    request(app.listen())
      .post('/v1/user/register')
      .send(user)
      .expect((res)=>{
        res.body.Message = "Success"
      })
      .expect(500,done);
  })

  it('Should activate verified user', function*(){

    let user = new User({
      email: "email@example.com",
      firstName: "Test",
      lastName: "Last",
      password: "secret"
    })

      let newUser = yield user.encryptPassword().save();
      let redisReply = yield redis.hmset("testKey","id",newUser.id,"type","register");
      assert.equal(redisReply,'OK');


      let response = yield coRequest(app.listen()).get('/v1/user/verify?token=testKey')
      assert.equal(response.status,200);

  })

  it('Should login a valid active user and issue a jwt', function*(){

    let user = new User({
      email: "email@example.com",
      firstName: "Test",
      lastName: "Last",
      password: "secret"
    })

    let login = {
      username:"email@example.com",
      password: 'secret'
    }

    let newUser = yield user.encryptPassword().save();

    let redisReply = yield redis.hmset("testKey","id",newUser.id,"type","register");
    assert.equal(redisReply,'OK')

    let response = yield coRequest(app.listen()).get('/v1/user/verify?token=testKey')
    assert.equal(response.status,200);

    let loginResponse = yield coRequest(app.listen()).post('/v1/auth/login').send(login)
    assert.equal(loginResponse.status,202)
    assert.notEqual(loginResponse.body.token,null);

  })

  it('Should only allow login for active users', (done)=>{

    let user = new User({
      email: "email@example.com",
      firstName: "Test",
      lastName: "Last",
      password: "secret",
    })

    let login = {
      username:"email@example.com",
      password: 'secret'
    }
    request(app.listen())
      .post('/v1/user/register')
      .send(user)
      .end(function(err, res){
        if (err) return done(err)
        request(app.listen())
          .post('/v1/auth/login')
          .send(login)
          .expect(401,done);


      });

  })

  it('Should throw error when wrong password is provided',(done)=>{

    let user = new User({
      email: "email@example.com",
      firstName: "Test",
      lastName: "Last",
      password: "secret",
    })

    let login = {
      username:"email@example.com",
      password: 'wrong'
    }
    request(app.listen())
      .post('/v1/user/register')
      .send(user)
      .end(function(err, res){
        if (err) return done(err)
        request(app.listen())
          .post('/v1/auth/login')
          .send(login)
          .expect(function(res){
            assert.equal(res.body.token,undefined)
          })
          .expect(401,done);


      });


  })

  it('It should not allow duplicate usernames', (done)=>{

    let userOne, userTwo, firstName, lastName, email, password;

    email = "test@gmail.com"
    firstName = "First"
    lastName = "Last"
    password = "password"

    userOne = new User({
      email: email,
      password: password,
      firstName: firstName,
      lastName:lastName
    })
    userTwo = new User({
      email: email,
      password: password,
      firstName: firstName,
      lastName:lastName
    })

    request(app.listen())
      .post('/v1/user/register')
      .send(userOne)
      .end(function(err, res){
        if (err) return done(err)
        request(app.listen())
          .post('/v1/user/register')
          .send(userTwo)
          .expect(500,done);

      })



  })

  it('Should allow password reset and send email with link',function*(){

    let user = new User({
      email: "email@example.com",
      firstName: "Test",
      lastName: "Last",
      password: "secret"
    })


    let newUser = yield user.encryptPassword().save();
    let resetResponse = yield coRequest(app.listen()).get('/v1/user/reset?email=' + user.email);
    assert.equal(resetResponse.status,200);
    assert.equal(resetResponse.body.Message,"Success");

  })

  it('Should rest password if token was provided',function*(){

    let user = new User({
      email: "email@example.com",
      firstName: "Test",
      lastName: "Last",
      password: "secret"
    })

    let resetBody = {
      token:'testKey',
      newPassword: 'newsecret'
    }

    let newUser = yield user.encryptPassword().save();
    let resetResponse = yield coRequest(app.listen()).get('/v1/user/reset?email=' + user.email);
    let redisReply = yield redis.hmset("testKey","id",newUser.id,"type","reset");
    assert.equal(redisReply,'OK');
    let newResponse = yield coRequest(app.listen()).post('/v1/user/reset').send(resetBody);
    assert.equal(newResponse.status,200);
    assert.equal(newResponse.body.Message,"Success");

  })




})
