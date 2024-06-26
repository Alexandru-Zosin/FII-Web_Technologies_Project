const parse = require('json2csv');
const mysql = require('mysql');
const { getConnectionFromPool, queryDatabase } = require('../../utils/databaseConnection');
const { getTables, getTable, uploadToTable, updateInTable, deleteFromTable } = require('../../utils/databaseTemplateModel');
const { csvToJson } = require('../../utils/jsoncsvConverter');

const resourcesPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'refi'
});

async function getResourcesTables() {
    const connection = await getConnectionFromPool(resourcesPool);
    return getTables(connection, "refi");
}

async function getResourceTable(tableName, startRow = 1, endRow = 10) { // getTable
    const connection = await getConnectionFromPool(resourcesPool);
    return getTable(connection, tableName, startRow, endRow);
}

async function uploadToResourceTable(tableName, values) { // uploadToTable
    const connection = await getConnectionFromPool(resourcesPool);
    return uploadToTable(connection, tableName, values);
}

async function updateInResourceTable(tableName, idFields, oldIdValues, newIdValues) { // updateInTable
    const connection = await getConnectionFromPool(resourcesPool);
    return updateInTable(connection, tableName, idFields, oldIdValues, newIdValues);
}

async function deleteFromResourceTable(tableName, idFields, idValues) { // deleteFromTable
    const connection = await getConnectionFromPool(resourcesPool);
    return deleteFromTable(connection, tableName, idFields, idValues);
}

async function importResourcesTables(type, importData) {
    if (type === 'csv') {
        importData = await csvToJson(importData);
    }

    const connection = await getConnectionFromPool(resourcesPool);

    const getTablesQuery = `SHOW TABLES`;
    const tablesQueryResult = await queryDatabase(connection, getTablesQuery, []);
    let tablesDeleted = 0;
    const tableDeleted = await new Promise((res) => {
        if (tablesQueryResult.length == 0)
            res('done');
        tablesQueryResult.map(async (table) => {
            await queryDatabase(connection, `DROP TABLE IF EXISTS ${table[`Tables_in_refi`]}`, []);
            tablesDeleted++;
            if (tablesDeleted == tablesQueryResult.length)
                res('done');
        })
    });

    const tableNames = Object.keys(importData);
    let tablesProcessed = 0;

    tableNames.forEach(async (tableName) => {
        const rows = importData[tableName];
        if (rows.length === 0) {
            tablesProcessed += 1;
            if (tablesProcessed === tableNames.length) {
                connection.release();
            }
            return;
        }

        const columns = Object.keys(rows[0]);

        const createTableQuery = `CREATE TABLE ${tableName} (${columns.map(col => `${col} MEDIUMTEXT`).join(', ')})`;
        await queryDatabase(connection, createTableQuery, []);

        for (const row of rows) {
            const values = columns.map(col => mysql.escape(row[col])).join(', ');
            const insertDataQuery = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values})`;
            await queryDatabase(connection, insertDataQuery, []);
        }        

        tablesProcessed++;
        if (tablesProcessed === tableNames.length) {
            connection.release();
        }
    });
}

async function exportResourcesTables(type) {
    const connection = await getConnectionFromPool(resourcesPool);

    const getTablesQuery = `SHOW TABLES`;
    const getTablesQueryResult = await queryDatabase(connection, getTablesQuery, []);

    const allData = {};
    let tablesProcessed = 0;
    const alldata = await new Promise((res) => {
        getTablesQueryResult.forEach(async (table) => {
            const tableName = table[`Tables_in_refi`];
            const getDataQuery = `SELECT * FROM ${tableName}`;
            const getDataQueryResult = await queryDatabase(connection, getDataQuery, []);

            allData[tableName] = getDataQueryResult;
            tablesProcessed += 1;

            if (tablesProcessed === getTablesQueryResult.length) {
                connection.release();
                res(allData);
            }
        });
    });

    if (type === 'csv') {
        let csvString = '';
        for (const [table, data] of Object.entries(alldata)) {
            try {
                const csv = parse.parse(data, { header: true });
                csvString += `\nTable: ${table}\n${csv}\n`;
            } catch (err) {
                console.error(`Error converting table ${table} to CSV:`, err);
            }
        }
        const csvData = { data: csvString };
        return csvData;
    } else {
        return alldata;
    }
}

module.exports = {
    getResourcesTables: getResourcesTables,
    getTable: getResourceTable,
    uploadToTable: uploadToResourceTable,
    updateInTable: updateInResourceTable,
    deleteFromTable: deleteFromResourceTable,
    importResourcesTables: importResourcesTables,
    exportResourcesTables: exportResourcesTables,
};