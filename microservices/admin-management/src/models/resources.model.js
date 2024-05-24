const mysql = require('mysql');
const { getConnectionFromPool } = require('../../utils/databaseConnection');
const { getTables, getTable, uploadToTable, updateInTable, deleteFromTable } = require('../../utils/databaseTemplateModel');

const resourcesPool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ReFI'
});

async function getResourcesTables() {
    const connection = await getConnectionFromPool(resourcesPool);
    return getTables(connection, "ReFI");
}

async function getResourceTable(tableName, startRow = 1, endRow = 10) {
    const connection = await getConnectionFromPool(resourcesPool);
    return getTable(connection, tableName, startRow, endRow);
}

async function uploadToResourceTable(tableName, values) {
    const connection = await getConnectionFromPool(resourcesPool);
    return uploadToTable(connection, tableName, values);
}

async function updateInResourceTable(tableName, idFields, oldIdValues, newIdValues) {
    const connection = await getConnectionFromPool(resourcesPool);
    return updateInTable(connection, tableName, idFields, oldIdValues, newIdValues);
}

async function deleteFromResourceTable(tableName, idFields, idValues) {
    const connection = await getConnectionFromPool(resourcesPool);
    return deleteFromTable(connection, tableName, idFields, idValues);
}

module.exports = {
    getResourcesTables: getResourcesTables,
    getTable: getResourceTable,
    uploadToTable: uploadToResourceTable,
    updateInTable: updateInResourceTable,
    deleteFromTable: deleteFromResourceTable
};