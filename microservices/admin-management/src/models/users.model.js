const mysql = require('mysql');
const { getConnectionFromPool } = require('../../utils/databaseConnection');
const { getTables, getTable, uploadToTable, updateInTable, deleteFromTable } = require('../../utils/databaseTemplateModel');

const usersPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ReFIUSERS'
});

async function getUsersTables() {
    const connection = await getConnectionFromPool(usersPool);
    return getTables(connection, "ReFIUSERS");
}

async function getUserTable(tableName, startRow = 1, endRow = 10) {
    const connection = await getConnectionFromPool(usersPool);
    return getTable(connection, tableName, startRow, endRow);
}

async function uploadToUserTable(tableName, values) {
    const connection = await getConnectionFromPool(usersPool);
    return uploadToTable(connection, tableName, values);
}

async function updateInUserTable(tableName, idFields, oldIdValues, newIdValues) {
    const connection = await getConnectionFromPool(usersPool);
    return updateInTable(connection, tableName, idFields, oldIdValues, newIdValues);
}

async function deleteFromUserTable(tableName, idFields, idValues) {
    const connection = await getConnectionFromPool(usersPool);
    return deleteFromTable(connection, tableName, idFields, idValues);
}

module.exports = {
    getUsersTables: getUsersTables,
    getTable: getUserTable,
    uploadToTable: uploadToUserTable,
    updateInTable: updateInUserTable,
    deleteFromTable: deleteFromUserTable
};