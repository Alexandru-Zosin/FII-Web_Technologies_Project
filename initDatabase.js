var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");

  let dropDbSql = `DROP DATABASE IF EXISTS ReFI`;

  con.query(dropDbSql, function (err, result) {
    if (err) throw err;
    console.log("Database dropped.");

    let createDbSql = `CREATE DATABASE ReFI`;

    con.query(createDbSql, function (err, result) {
      if (err) throw err;
      console.log("Database created.");

      con.end(function (err) {
        if (err) throw err;

        var conDB = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "",
          database: "ReFI",
        });

        conDB.connect(async function (err) {
          if (err) throw err;
          console.log("Connected to BookingIasi!");

          let createTableSql = `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            password TEXT NOT NULL,
            darktheme BOOLEAN,
            openaikey TEXT,
            role VARCHAR(255) DEFAULT 'user'
          );`;
          
          await new Promise((res) => {
            conDB.query(createTableSql, function (err, result) {
              res(result);
            });
          });
          


        //   let insertSql = `INSERT INTO users 
        //   (email, givenName, familyName, password, username, birthDate, height, weight, gender, needsSpecialAssistance, userAgreedToFetchData, activityIndex) 
        //   VALUES 
        //   (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        //   userData.forEach((user) => {
        //     new Promise((res) => {
        //       conDB.query(insertSql, user, function (err, result) {
        //         if (err) throw err;
        //         console.log("User record inserted:", result.insertId);
        //         res(result);
        //       });
        //     });
        //   });
        });
      });
    });
  });
});
