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
const readJsonFile = (filePath) => {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

const connectToDatabase = (config) => {
    return new Promise((res, rej) => {
        const connection = mysql.createConnection(config);
        connection.connect((err) => {
            if (err) {
                rej(err);
            } else {
                res(connection);
            }
        });
    });
};

const queryDatabase = (connection, sql, values = []) => {
    return new Promise((res, rej) => {
        connection.query(sql, values, (err, result) => {
            if (err) {
                rej(err);
            } else {
                res(result);
            }
        });
    });
};

const closeConnection = (connection) => {
    return new Promise((res, rej) => {
        connection.end((err) => {
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    });
};

const initializeDatabases = async () => {
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
        for (const dbConfig of databases) {
            const data = readJsonFile(path.join(__dirname, "databaseManagement", dbConfig.databaseConfigName));

            if (data.length > 0) {
                // Create table based on the first object keys
                const columns = Object.keys(data[0]).map(key => `${key} ${key === 'id' ? 'INT' : 'VARCHAR(255)'}`).join(", ");
                const createTableSql = `CREATE TABLE IF NOT EXISTS ${dbConfig.databaseName} (${columns});`;

                await queryDatabase(conReFI, createTableSql);
                console.log(`Table ${dbConfig.databaseName} created.`);

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
                    const keys = Object.keys(record).join(", ");
                    const values = recordsToInsert.map(Object.values);
                    const placeholders = recordsToInsert.map(() => `(${Object.values(record).map(() => '?').join(", ")})`).join(", ");
                    const insertSql = `INSERT INTO ${dbConfig.databaseName} (${keys}) VALUES ${placeholders}`;

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
};

initializeDatabases();