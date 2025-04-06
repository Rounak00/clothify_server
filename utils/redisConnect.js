const ioredis = require('ioredis');
const REDIS_URL = require('../config').REDIS_URL;

const redis_client = new ioredis(REDIS_URL);
redis_client.on('connect', () => {
    console.log('Redis connected ...'); 
}
);
module.exports= redis_client;
