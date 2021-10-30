"use strict";
/** Database setup for jobly. */
const { Client } = require("pg");
const { dbUriBase, getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: `${dbUriBase}${getDatabaseUri()}`,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: `${dbUriBase}${getDatabaseUri()}`
  });
};

db.connect();

module.exports = db;