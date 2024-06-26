const { getTable, uploadToTable, updateInTable, deleteFromTable } = require('../models/users.model');
const { getEntities, uploadEntity, updateEntity, deleteEntity } = require('../../utils/databaseTemplateController');

async function getUsers(req, res, tableName) {
    return getEntities(req, res, tableName, getTable);
}

async function uploadUser(req, res, tableName) {
    return uploadEntity(req, res, tableName, uploadToTable);
}

async function updateUser(req, res, tableName) {
    return updateEntity(req, res, tableName, updateInTable);
}

async function deleteUser(req, res, tableName) {
    return deleteEntity(req, res, tableName, deleteFromTable);
}

module.exports = { getUsers, uploadUser, updateUser, deleteUser };