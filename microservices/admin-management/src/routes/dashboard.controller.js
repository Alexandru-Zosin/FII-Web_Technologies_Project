const { getUsersTables } = require('../models/users.model');
const { getResourcesTables } = require('../models/resources.model');

async function getDashboard(req, res) {
    try {
        const databases = {};
        const userTables = await getUsersTables();
        const resourceTables = await getResourcesTables();

        var index = 1;
        userTables.forEach((table) => {
            databases[index++] = `users/${table["TABLE_NAME"]}`;
        });
        resourceTables.forEach((table) => {
            databases[index++] = `resources/${table["TABLE_NAME"]}`;
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(databases));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            error: "Internal Server Error"
        }));
    }
}

module.exports = { getDashboard };