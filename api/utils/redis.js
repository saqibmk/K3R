import config from '../config/database';



var redis = require('redis');
var client = redis.createClient(config.redis.port, config.redis.host);

client.on('connect', function () {
    console.log('Redis is ready');
});

var wrapper = require('co-redis');
var redisClient = wrapper(client);


client.on('error',function(e){
  console.log(e);
})



export default redisClient;
