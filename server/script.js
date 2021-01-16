var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");

var app = express();

app.use(bodyParser.urlencoded());

app.use(bodyParser.json());

var connection = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "admin",
  database: "db360"
});

connection.connect(function(err) {
  if (!!err) {
    console.log("Error: " + err);
  } else {
    console.log("Connected");
  }
});

app.post("/login", (req, res) => {
  let query =
    "SELECT DISTINCT course.id AS courseid, course.title, student.name, grade FROM student NATURAL JOIN classsection INNER JOIN course ON course.id = classsection.courseid     WHERE student.studentid = " +
    req.body.id;
  connection.query(
    query,

    function(err, rows, fields) {
      if (!!err) {
        res.send(undefined);
      } else {
        res.send(rows);
      }
    }
  );
});

app.post("/careerList", (req, res) => {
  connection.query("SELECT * FROM career", function(err, rows, fields) {
    if (!!err) {
      console.log("Error in query: " + err);
    } else {
      res.send(rows);
    }
  });
});

app.post("/allClassesNeeded", (req, res) => {
  let query =
    "SELECT * FROM course LEFT JOIN preq ON course.id = preq.courseid WHERE course.id IN(( SELECT courseid as id FROM graduation UNION SELECT courseid as id FROM wants WHERE wants.careerid = " +
    req.body.chosenProfession +
    " )) AND course.id NOT IN ( SELECT courseid FROM classsection WHERE studentid = " +
    req.body.studentId +
    " )";
  connection.query(
    query,

    function(err, rows, fields) {
      if (!!err) {
        console.log("Error in query: " + err);
      } else {
        res.send(rows);
      }
    }
  );
});

app.post("/suggestClasses", (req, res) => {
  let query =
    "SELECT * FROM course LEFT JOIN preq ON course.id = preq.courseid WHERE course.id IN(( SELECT courseid as id FROM graduation UNION SELECT courseid as id FROM wants WHERE wants.careerid = " +
    req.body.chosenProfession +
    " )) AND course.id NOT IN ( SELECT courseid FROM classsection WHERE studentid = " +
    req.body.studentId +
    " ) ORDER BY course.id";
  connection.query(
    query,

    function(err, rows, fields) {
      if (!!err) {
        console.log("Error in query: " + err);
      } else {
        res.send(rows);
      }
    }
  );
});

app.post("/preqList", (req, res) => {
  connection.query(
    "SELECT a.requires, a.initial, b.secondary, c.third FROM (SELECT requires, courseid, count(requires) initial FROM preq GROUP BY requires) as a LEFT JOIN (SELECT requires, courseid, count(requires) secondary FROM preq GROUP BY requires) as b on  a.courseid = b.requires LEFT JOIN (SELECT requires, courseid, count(requires) third FROM preq GROUP BY requires) as c on b.courseid = c.requires",
    function(err, rows, fields) {
      if (!!err) {
        console.log("Error in query: " + err);
      } else {
        res.send(rows);
      }
    }
  );
});

app.listen(8080);
