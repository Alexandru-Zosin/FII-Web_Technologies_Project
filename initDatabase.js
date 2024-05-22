const mysql = require("mysql");
const fs = require("fs");
const path = require("path");

// database configurations
const databases = [
    { databaseName: "technologies", databaseConfigName: "technologies.json" },
    { databaseName: "languages", databaseConfigName: "languagesDatabase.json" },
    { databaseName: "license", databaseConfigName: "licenseDatabase.json" },
    { databaseName: "liveCoding", databaseConfigName: "liveCodingDatabase.json" },
    { databaseName: "platforms", databaseConfigName: "platformsDatabase.json" },
    { databaseName: "purpose", databaseConfigName: "purposeDatabase.json" },
    { databaseName: "realtimeCollaboration", databaseConfigName: "realtimeCollaborationDatabase.json" },
    { databaseName: "type", databaseConfigName: "typeDatabase.json" }
];

// function to read JSON files
function readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function connectToDatabase(config) {
    return new Promise(function(res, rej) {
        const connection = mysql.createConnection(config);
        connection.connect(function(err) {
            if (err) {
                rej(err);
            } else {
                res(connection);
            }
        });
    });
}

function queryDatabase(connection, sql, values) {
    values = values || [];
    return new Promise(function(res, rej) {
        connection.query(sql, values, function(err, result) {
            if (err) {
                rej(err);
            } else {
                res(result);
            }
        });
    });
}

function closeConnection(connection) {
    return new Promise(function(res, rej) {
        connection.end(function(err) {
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    });
}

async function initializeDatabases() {
    try {
        const con = await connectToDatabase({
            host: "localhost",
            user: "root",
            password: "",
        });

        console.log("Connected to MySQL!");

        await queryDatabase(con, `DROP DATABASE IF EXISTS ReFIUSERS`);
        console.log("ReFIUSERS database dropped.");
        await queryDatabase(con, `CREATE DATABASE ReFIUSERS`);
        console.log("ReFIUSERS database created.");

        const conUsers = await connectToDatabase({
            host: "localhost",
            user: "root",
            password: "",
            database: "ReFIUSERS",
        });

        console.log("Connected to ReFIUSERS!");

        const createUserTableSql = `CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(255) NOT NULL,
            password TEXT NOT NULL,
            darktheme BOOLEAN,
            openaikey TEXT,
            role VARCHAR(255) DEFAULT 'user'
        );`;

        await queryDatabase(conUsers, createUserTableSql);
        console.log("Users table created in ReFIUSERS.");

        await closeConnection(conUsers);
        console.log("ReFIUSERS connection closed.");

        //
        await queryDatabase(con, `DROP DATABASE IF EXISTS ReFI`);
        console.log("ReFI database dropped.");
        await queryDatabase(con, `CREATE DATABASE ReFI`);
        console.log("ReFI database created.");

        const conReFI = await connectToDatabase({
            host: "localhost",
            user: "root",
            password: "",
            database: "ReFI",
        });

        console.log("Connected to ReFI!");

        // Process each database configuration
        for (var i = 0; i < databases.length; i++) {
            var dbConfig = databases[i];
            var data = readJsonFile(path.join(__dirname, "databaseManagement", dbConfig.databaseConfigName));

            if (data.length > 0) {
                // Create table based on the first object keys
                var columns = Object.keys(data[0]).map(function(key) {
                    return key + " " + (key === 'id' ? 'INT' : 'VARCHAR(255)');
                }).join(", ");
                var createTableSql = `CREATE TABLE IF NOT EXISTS ${dbConfig.databaseName} (${columns});`;

                await queryDatabase(conReFI, createTableSql);
                console.log(`Table ${dbConfig.databaseName} created.`);

                // Insert data into the table
                for (var j = 0; j < data.length; j++) {
                    var record = data[j];
                    // Find keys that contain arrays
                    var arrayKeys = Object.keys(record).filter(function(key) {
                        return Array.isArray(record[key]);
                    });

                    // Generate all records to be inserted
                    var recordsToInsert = [record];

                    for (var k = 0; k < arrayKeys.length; k++) {
                        var key = arrayKeys[k];
                        var newRecords = [];

                        for (var l = 0; l < record[key].length; l++) {
                            var value = record[key][l];
                            for (var m = 0; m < recordsToInsert.length; m++) {
                                var rec = recordsToInsert[m];
                                var newRecord = Object.assign({}, rec, { [key]: value });
                                newRecords.push(newRecord);
                            }
                        }

                        recordsToInsert = newRecords;
                    }

                    // Insert all records into the table
                    var keys = Object.keys(record).join(", ");
                    var values = recordsToInsert.map(Object.values);
                    var placeholders = recordsToInsert.map(function() {
                        return `(${Object.values(record).map(function() { return '?'; }).join(", ")})`;
                    }).join(", ");
                    var insertSql = `INSERT INTO ${dbConfig.databaseName} (${keys}) VALUES ${placeholders}`;

                    if (values.length > 0) {
                        await queryDatabase(conReFI, insertSql, values.flat());
                        console.log(`${dbConfig.databaseName} records inserted.`);
                    }
                }
            }
        }

        await closeConnection(conReFI);
        console.log("ReFI connection closed.");

        await closeConnection(con);
        console.log("Main connection closed.");

    } catch (err) {
        console.error(err);
    }
}

initializeDatabases();