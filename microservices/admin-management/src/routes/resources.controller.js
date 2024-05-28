const url = require('url');
const { getTable, uploadToTable, updateInTable, deleteFromTable, importResourcesTables, exportResourcesTables } = require('../models/resources.model');
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

async function importResources(req, res) {
    const parsedUrl = url.parse(req.url, true);  
    const query = parsedUrl.query;
    const type = query.type; 

    try { 
        await importResourcesTables(type, req.body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Resources imported successfully' }));
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            err: `Internal Server Error: ${error}.`
        }));
    }
}

async function exportResources(req, res) {
    const parsedUrl = url.parse(req.url, true);  
    const query = parsedUrl.query;
    const type = query.type; 

    try {
        const data = await exportResourcesTables(type);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(data));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            err: `Internal Server Error: ${error}.`
        }));
    }
}

module.exports = { getResources, uploadResource, deleteResource, updateResource, importResources, exportResources };