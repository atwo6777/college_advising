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
        console.log("Error in query: " + err);
      } else {
        // console.log;
        res.send(rows);
      }
    }
  );
});

app.post("/careerList", (req, res) => {
  connection.query(
    "SELECT * FROM career",

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
  console.log(req.body);
  let query =
    "SELECT * FROM course INNER JOIN preq ON course.id = preq.courseid WHERE course.id IN ( SELECT courseid FROM graduation UNION SELECT courseid FROM wants WHERE wants.careerid =" +
    req.body.studentId +
    ") AND course.id NOT IN ( SELECT courseid FROM student natural JOIN classsection INNER JOIN course ON course.id = classsection.courseid WHERE student.studentid = " +
    req.body.chosenProfession +
    ")";
  console.log(query);
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

app.listen(8080);
