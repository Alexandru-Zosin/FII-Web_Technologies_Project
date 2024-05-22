const mysql = require('mysql');
const { connectToDatabase, queryDatabase, closeConnection } = require('../../utils/databaseOperations');

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ReFIUSERS'
};

async function getUsersTables() {
    const conUsers = await connectToDatabase(config);

    const selectTablesQuery = `
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_SCHEMA = 'ReFIUSERS';
    `;

    const tables = await queryDatabase(conUsers, selectTablesQuery);
    await closeConnection(conUsers);

    return tables;
}

module.exports = { getUsersTables };
