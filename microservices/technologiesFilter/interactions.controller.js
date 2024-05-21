const { retrieveEnvValue } = require('./envValueRetrieval.controller.js');
const fetch = require('node-fetch');
const url = require('url');
const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ReFI'
});

async function getConnectionFromPool() {
    return await new Promise((res) => {
        pool.getConnection((err, conn) => {
            res(conn);
        });
    });
}
// strategy make 3 requests at maximum and then we stop any requests (basically try 3 times to get a valid message from the ai)

const applyCorsHeadersOnRequest = async (req, res) => {
    validateHeadersForCors(req, res);
    res.writeHead(204, {
        'Content-Length': '0'
    });
    res.end();
}

const validateHeadersForCors = async (req, res) => {
    const requestOrigin = req.headers.origin;
    if ('https://localhost:3556' == requestOrigin) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        return true;
    } else {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden.' }));
        return false;
    }
}

const MAXMIMUM_NUMBER_OF_TRIES = 3;

const fetchTechnologeisFromDatabase = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);  // `true` parses the query string into an object
  const query = parsedUrl.query;  // This contains the parsed query string as an object
  const jsonFilters = query.jsonFilters; 
  console.log(jsonFilters);
  try {
    const sqlResponse = await fetchResultsFromSql(JSON.parse(jsonFilters));

    res.writeHead(200, {'Content-Type': 'application/json', });
    res.end(JSON.stringify(sqlResponse)); 
  }
  catch (e) {
    console.log(e);
    res.writeHead(406)
    res.end(JSON.stringify({message: "JSON parsing was invalid. Aborting"}))
  }
};

const fetchResultsFromSql = async (jsonObject) => {
  const connection = await getConnectionFromPool();

  const sql = `
  SELECT lang.id
  FROM languages lang
  JOIN license lic ON lang.id = lic.id
  JOIN liveCoding live ON lang.id = live.id
  JOIN platforms plat ON lang.id = plat.id
  JOIN realTimeCollaboration realtime ON lang.id = realtime.id
  JOIN purpose purp on purp.id = lang.id
  JOIN type t ON lang.id = t.id
  WHERE plat.Platforms IN (${jsonObject.Platform.map(value => `'${value}'`).join(', ')})
  AND lang.Language IN (${jsonObject.Language.map(value => `'${value}'`).join(', ')})
  AND t.Type IN (${jsonObject.Type.map(value => `'${value}'`).join(', ')})
  AND purp.Purpose IN (${jsonObject.Purpose.map(value => `'${value}'`).join(', ')})
  AND lic.License IN (${jsonObject.License.map(value => `'${value}'`).join(', ')})
  LIMIT 3;
  `
  // for now expluded for the query since hard to determine by the ai (should introduce the options of multiple so we can deduce if the usre does not care about theese)
  // AND realtime.realtimeCollaboration = ${jsonObject['Realtime Collaboration'] ? "1" : "0"}
  // AND live.interactivity = ${jsonObject['Live Coding'] ? "1" : "0"};

  // error handling
  const idsResult = await new Promise((res) => connection.query(sql, (err, result) => {
    res(result);
  }));
  const ids = idsResult.map(row => row.id);

  if (ids.length > 0) {
    const technologiesQuery = `
      SELECT *
      FROM technologies
      WHERE id IN (${ids.map(id => `'${id}'`).join(', ')});
    `;

    // Execute the second query to get the information from the technologies table
    const technologiesResult = await new Promise(res => connection.query(technologiesQuery, (err, result) => {
      res(result)
    }));

    // Now you have the technologiesResult which contains all the information for the given IDs
    console.log(technologiesResult);
    return technologiesResult;
  } else {
    console.log("No matching IDs found.");
    throw new Error("No technology found");
  }
}

module.exports = {
  fetchTechnologeisFromDatabase,
  validateHeadersForCors,
  applyCorsHeadersOnRequest
}