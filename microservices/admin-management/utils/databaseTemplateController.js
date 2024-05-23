const url = require('url');

async function getEntities(req, res, tableName, getTable) {
    try {
        const query = url.parse(req.url, true).query;
        const startRow = parseInt(query["startRow"]);
        const endRow = parseInt(query["endRow"]);

        const tableEntries = await getTable(tableName, startRow, endRow);
        
        const response = {};
        let index = 1;
        tableEntries.forEach((entry) => {
            response[index++] = entry;
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(response));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            err: `Internal Server Error: ${error}.`
        }));
    }
}

async function uploadEntity(req, res, tableName, uploadToTable) {
    const { } = req.body;
}

async function updateEntity(req, res, tableName, updateInTable) {
    const { } = req.body;
}

async function deleteEntity(req, res, tableName, deleteFromTable) {
    const { } = req.body;
}

module.exports = { getEntities, uploadEntity, updateEntity, deleteEntity };