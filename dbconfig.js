var mysql = require("mysql");

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass",
    database: "customerdb"
});

module.exports = con