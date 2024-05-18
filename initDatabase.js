const mysql = require("mysql");
const fs = require("fs");
const path = require("path");

// Database configurations
const databases = [
  { databaseName: "technologies", databaseConfigName: "technologies.json" },
  { databaseName: "languages", databaseConfigName: "languagesDatabase.json" },
  { databaseName: "license", databaseConfigName: "licenseDatabase.json" },
  { databaseName: "liveCoding", databaseConfigName: "liveCodingDatabase.json" },
  { databaseName: "platforms", databaseConfigName: "platformsDatabase.json" },
  { databaseName: "purpose", databaseConfigName: "purposeDatabase.json" },
  { databaseName: "realtimeCollaboration", databaseConfigName: "realtimeCollaborationDatabase.json" },
  { databaseName: "rendering", databaseConfigName: "renderingDatabase.json" },
  { databaseName: "type", databaseConfigName: "typeDatabase.json" }
];

// Function to read JSON files
const readJsonFile = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const con = mysql.createConnection({
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

        const conDB = mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "",
          database: "ReFI",
        });

        conDB.connect(async function (err) {
          if (err) throw err;
          console.log("Connected to ReFI!");

          let createUserTableSql = `CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            password TEXT NOT NULL,
            darktheme BOOLEAN,
            openaikey TEXT,
            role VARCHAR(255) DEFAULT 'user'
          );`;
          
          await new Promise((res) => {
            conDB.query(createUserTableSql, function (err, result) {
              if (err) throw err;
              res(result);
            });
          });

          // Process each database configuration
          for (const dbConfig of databases) {
            const data = readJsonFile(path.join(__dirname, "databaseManagement", dbConfig.databaseConfigName));

            if (data.length > 0) {
              // Create table based on the first object keys
              const columns = Object.keys(data[0]).map(key => `${key} ${key === 'id' ? 'INT' : 'VARCHAR(255)'}`).join(", ");
              const createTableSql = `CREATE TABLE IF NOT EXISTS ${dbConfig.databaseName} (${columns});`;

              await new Promise((res) => {
                conDB.query(createTableSql, function (err, result) {
                  if (err) throw err;
                  res(result);
                });
              });

              // Insert data into the table
              for (const record of data) {
                // Find keys that contain arrays
                const arrayKeys = Object.keys(record).filter(key => Array.isArray(record[key]));
                
                // Generate all records to be inserted
                let recordsToInsert = [record];
                
                for (const key of arrayKeys) {
                  const newRecords = [];
                  
                  for (const value of record[key]) {
                    for (const rec of recordsToInsert) {
                      const newRecord = { ...rec, [key]: value };
                      newRecords.push(newRecord);
                    }
                  }
                  
                  recordsToInsert = newRecords;
                }

                // Insert all records into the table
                const insertSql = `INSERT INTO ${dbConfig.databaseName} (${Object.keys(record).join(", ")}) VALUES ?`;
                const values = recordsToInsert.map(Object.values);
                if (values.length == 0)
                  continue;

                await new Promise((res) => {
                  conDB.query(insertSql, [values], function (err, result) {
                    if (err) throw err;
                    console.log(`${dbConfig.databaseName} records inserted: ${result.affectedRows}`);
                    res(result);
                  });
                });
              }
            }
          }

          conDB.end(function (err) {
            if (err) throw err;
            console.log("All databases loaded and connection closed.");
          });
        });
      });
    });
  });
});
