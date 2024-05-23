const mysql = require('mysql');
const { getConnectionFromPool, queryDatabase } = require('../../utils/databaseConnection');

const usersPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ReFIUSERS'
});

async function getUsersTables() {
    const connection = await getConnectionFromPool(usersPool);

    const selectTablesQuery = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_SCHEMA = 'ReFIUSERS';
    `;

    const tables = await queryDatabase(connection, selectTablesQuery);
    connection.release();

    return tables;
}

/*async function getTableColumnNames(tableName) {
    const connection = await getConnectionFromPool(usersPool);
    const query = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'ReFIUSERS' AND TABLE_NAME = ?;
    `;
    try {
        const results = await queryDatabase(connection, query, [tableName]);
        connection.release();
        const columnNames = results.map(row => row.COLUMN_NAME);
        return columnNames;
    } catch (err) {
        connection.release();
        throw err;
    }
}*/

async function getTable(tableName, startRow = 1, endRow = 10) {
    const connection = await getConnectionFromPool(usersPool);
    // https://www.w3schools.com/php/php_mysql_select_limit.asp
    const offset = startRow - 1;
    const limit = endRow - startRow + 1;
    const query = `SELECT * FROM ?? LIMIT ? OFFSET ?`;

    try {
        const results = await queryDatabase(connection, query, [tableName, limit, offset]);
        connection.release();
        return results;
    } catch (err) {
        connection.release();
        throw err;
    }
}

async function uploadToTable(tableName, values) {
    const connection = await getConnectionFromPool(usersPool);
    const query = `INSERT INTO ?? SET ?`;
    try {
        const results = await queryDatabase(connection, query, [tableName, values]);
        connection.release();
        return results;
    } catch (err) {
        connection.release();
        throw err;
    }
}

async function updateInTable(tableName, values, idField, idValue) {
    const connection = await getConnectionFromPool(usersPool);
    const query = `UPDATE ?? SET ? WHERE ?? = ?`;
    try {
        const results = await queryDatabase(connection, query, [tableName, values, idField, idValue]);
        connection.release();
        return results;
    } catch (err) {
        connection.release();
        throw err;
    }
}

async function deleteFromTable(tableName, idField, idValue) {
    const connection = await getConnectionFromPool(usersPool);
    const query = `DELETE FROM ?? WHERE ?? = ?`;
    try {
        const results = await queryDatabase(connection, query, [tableName, idField, idValue]);
        connection.release();
        return results;
    } catch (err) {
        connection.release();
        throw err;
    }
}

module.exports = { getUsersTables, getTable, uploadToTable, updateInTable, deleteFromTable };