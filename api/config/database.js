'use strict'

var config = {};

config.rethinkDB = {
  host: 'localhost',
  port: 28015,
  db: 'test'
}

config.redis = {
  host: "localhost",
  port:"2376"
}


exports.config = config;
