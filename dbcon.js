/*jslint node:true */
/*jslint undef: true*/

var mysql = require('mysql');
var pool = mysql.createPool({
        connectionLimit : 10,
        host            : 'classmysql.engr.oregonstate.edu',
        user            : 'cs340_nickersr',
        password        : '8841',
        database        : 'cs340_nickersr',
        multipleStatements: true
    });
module.exports.pool = pool;
