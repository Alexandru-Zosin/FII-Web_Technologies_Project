const url = require('url');

// (tableName, startRow = 1, endRow = 10) for getTable
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

// (tableName, values) for uploadToTable
async function uploadEntity(req, res, tableName, uploadToTable) {
    try {
        const values = req.body;
        await uploadToTable(tableName, Object.values(values));

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Entity uploaded successfully' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            err: `Internal Server Error: ${error}.`
        }));
    }
}

// (tableName, idFields, oldIdValues, newIdValues) for updateInTable
async function updateEntity(req, res, tableName, updateInTable) {
    try {
        const { old, updated } = req.body;

        const idFields = Object.keys(old);
        const oldIdValues = Object.values(old).map(value => value === null ? 'NULL' : value);
//        const oldIdValues = Object.values(old);
        const newIdValues = Object.values(updated);

        await updateInTable(tableName, idFields, oldIdValues, newIdValues);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Entity updated successfully' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            err: `Internal Server Error: ${error}.`
        }));
    }
}

// (tableName, idFields, idValues) for deleteFromTable
async function deleteEntity(req, res, tableName, deleteFromTable) {
    try {
        const values = req.body;
        const idFields = Object.keys(values);
        const idValues = Object.values(values);
        await deleteFromTable(tableName, idFields, idValues);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Entity deleted successfully' }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            err: `Internal Server Error: ${error}.`
        }));
    }
}

module.exports = { getEntities, uploadEntity, updateEntity, deleteEntity };