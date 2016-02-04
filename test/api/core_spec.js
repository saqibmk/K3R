import app from '../../api/server';
import request from 'supertest';

describe('Core Tests', () =>{
  it('Should return 200 OK status', (done) =>{
    request(app.listen())
      .get('/v1')
      .expect(200,done);
  })


})
