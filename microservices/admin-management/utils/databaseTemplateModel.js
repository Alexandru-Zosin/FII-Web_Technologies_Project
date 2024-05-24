const { queryDatabase } = require('./databaseConnection');

async function getTables(connection, db) {
    const selectTablesQuery = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_SCHEMA = '${db}';
    `;

    const tables = await queryDatabase(connection, selectTablesQuery, []);
    connection.release();

    return tables;
}

async function getTable(connection, tableName, startRow = 1, endRow = 10) {
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

async function uploadToTable(connection, tableName, values) {
    // construct the placeholders string for the clause
    const placeholders = values.map(() => '?').join(', ');
    const query = `INSERT INTO ?? VALUES(${placeholders})`;

    // combine tableName and destructured values into a single array
    const queryParams = [tableName, ...values];

    try {
        const results = await queryDatabase(connection, query, queryParams);
        connection.release();
        return results;
    } catch (err) {
        connection.release();
        throw err;
    }
}

async function updateInTable(connection, tableName, idFields, oldIdValues, newIdValues) {
    const setClauses = idFields.map(() => `?? = ?`).join(', ');    
    const whereClauses = idFields.map(() => `?? = ?`).join(' AND ');
    const query = `UPDATE ?? SET ${setClauses} WHERE ${whereClauses}`;

    // combine tableName, idFields, oldIdValues, and newIdValues into a single array
    const queryParams = [
        tableName,
        ...idFields.flatMap((field, index) => [field, newIdValues[index]]),
        ...idFields.flatMap((field, index) => [field, oldIdValues[index]])
    ];

    try {
        const results = await queryDatabase(connection, query, queryParams);
        connection.release();
        return results;
    } catch (err) {
        connection.release();
        throw err;
    }
}

async function deleteFromTable(connection, tableName, idFields, idValues) {
    const whereClauses = idFields.map(() => `?? = ?`).join(' AND ');
    const query = `DELETE FROM ?? WHERE ${whereClauses}`;

    // combine tableName, idFields and idValues into a single array
    const queryParams = [tableName, ...idFields.flatMap((field, index) => [field, idValues[index]])];

    try {
        const results = await queryDatabase(connection, query, queryParams);
        connection.release();
        return results;
    } catch (err) {
        connection.release();
        throw err;
    }
}

module.exports = { getTables, getTable, uploadToTable, updateInTable, deleteFromTable };