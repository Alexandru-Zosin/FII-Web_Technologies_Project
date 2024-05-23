const mysql = require('mysql');
const { getConnectionFromPool, queryDatabase } = require('../../utils/databaseConnection');

const resourcesPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ReFI'
});

async function getResourcesTables() {
    const connection = await getConnectionFromPool(resourcesPool);

    const selectTablesQuery = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_SCHEMA = 'ReFI';
    `;

    const tables = await queryDatabase(connection, selectTablesQuery);
    connection.release();

    return tables;
}

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

module.exports = { getResourcesTables, getTable };