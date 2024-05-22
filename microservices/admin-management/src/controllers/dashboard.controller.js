const { getUsersTables } = require('../models/users.model');
const { getResourcesTables } = require('../models/resources.model');

async function getDashboard(req, res) {
    try {
        const databases = {};
        const userTables = await getUsersTables();
        const resourceTables = await getResourcesTables();
        
        var index = 1;
        userTables.forEach((table) => {
            databases[index++] = table["TABLE_NAME"];
        });
        resourceTables.forEach((table) => {
            databases[index++] = table["TABLE_NAME"];
        });
    
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(databases));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
}

async function getUsers(req, res) {
// send users between x and y number
}

async function getResources(req, res) {
// sends resource table with given name
}

module.exports = { getDashboard, getUsers, getResources };