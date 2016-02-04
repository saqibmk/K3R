import request from 'supertest';
import app from '../../api/server';
import jwt from 'jsonwebtoken';


describe ('Testing protected route',()=>{
  it('Should not allow entry into protected route without valid jwt',(done)=>{
    request(app.listen())
      .get('/v1/protected')
      .expect(401,done);
  })

  it('Should allow the user in with a valid jwt claim',(done)=>{

    let user = {
      username: "admin",
      password: "password"
    }

    let token = jwt.sign(user , 'yourawesomesecret');
    request(app.listen())
        .get('/v1/protected')
        .set('Authorization', 'bearer ' + token)
        .expect(200,done);

  })
})
