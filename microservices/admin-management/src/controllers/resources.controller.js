const { getTable, uploadToTable, updateInTable, deleteFromTable } = require('../models/resources.model');
const { getEntities, uploadEntity, updateEntity, deleteEntity } = require('../../utils/databaseTemplateController');

async function getResources(req, res, tableName) {
    return getEntities(req, res, tableName, getTable);
}

async function uploadResource(req, res, tableName) {
    return uploadEntity(req, res, tableName, uploadToTable);
}

async function deleteResource(req, res, tableName) {
    return deleteEntity(req, res, tableName, deleteFromTable);
}

async function updateResource(req, res, tableName) {
    return updateEntity(req, res, tableName, updateInTable);
}

module.exports = { getResources, uploadResource, deleteResource, updateResource };