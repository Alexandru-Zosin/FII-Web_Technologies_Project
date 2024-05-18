const { retrieveEnvValue } = require('./envValueRetrieval.controller.js');
const { avjValidateJSONStructure } = require('./ajvvalidator.controller.js');
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
    if ('https://localhost' == requestOrigin) {
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

const createFiltersFromPrompt = async (req, res) => {
  for (let tryNumber = 1; tryNumber <= MAXMIMUM_NUMBER_OF_TRIES; ++tryNumber) {
    validateHeadersForCors(req, res); // in order to add the headers to the response for the cors
    const parsedUrl = url.parse(req.url, true);  // `true` parses the query string into an object
    const query = parsedUrl.query;  // This contains the parsed query string as an object
    const prompt = query.prompt; 
    const openAiKey = retrieveEnvValue('OPEN_AI_KEY');
    const openAiAskAction = constructAskFromPrompt(prompt, openAiKey);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: 'POST',
      headers: openAiAskAction.headers,
      body: JSON.stringify(openAiAskAction.payload)
    })

    const responsejson = await response.json();
    const responseJsonPayload = JSON.parse(responsejson.choices[0].message.content);
    console.log(responseJsonPayload)
    // if we manage to valide it the received json then we are on the track to respond with it
    const isJSONValid = avjValidateJSONStructure(responseJsonPayload); // later the validation here

    const sqlResponse = await fetchResultsFromSql(responseJsonPayload);

    if (isJSONValid) {
      res.writeHead(200, {'Content-Type': 'application/json', });
      res.end(JSON.stringify(sqlResponse)); 
      return;
    }
  }
  res.end(JSON.stringify({message: "AI generation has failed multiple times, aborting"}));
  res.writeHead(405);
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
  }
}

const constructAskFromPrompt = (userPrompt, api_key) => {
    headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${api_key}`
    }
    
    payload = {
        "model": "gpt-3.5-turbo-1106",
        "response_format": {"type": "json_object"},
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant. Your response should be in JSON format."
          },
          {
            "role": "system",
            "content": `Respond with a JSON object that validates the following schema (but dont add the semantic definitions or other stuff, just the pure JSON object): 
            {
              "properties": {
                "Platform": {
                  "type": "Array of Strings",
                  "description": "Supported operating systems or environments.",
                  "values": ["Cross-platform", "iOS", "Mac", "Windows", "Web", "Linux", "Multi-platform", "Android"]
                },
                "Language": {
                  "type": "Array of Strings",
                  "description": "Programming languages primarily used or supported.",
                  "values": ["C++", "JavaScript", "Swift", "Rust", "Kotlin", "HTML5", "TypeScript", "Clojure", "GLSL", "HLSL", "WGSL", "MSL", "CUDA", "Python", "Java"]
                },
                "Type": {
                  "type": "Array of Strings",
                  "description": "Categorization as a framework, library, SDK, engine, tool, IDE, API, or editor.",
                  "values": ["Framework", "Library", "SDK", "Engine", "IDE", "Tool", "Environment", "API", "Editor"]
                },
                "Purpose": {
                  "type": "Array of Strings",
                  "description": "Primary use case or domain of application.",
                  "values": ["Game Development", "Visual Arts", "Data Visualization", "Audio Production", "Video Mapping", "Generative Design", "3D Modeling", "Live Graphics", "Particle Effects", "Projection Mapping"]
                },
                "License": {
                  "type": "Array of Strings",
                  "description": "Type of licensing model.",
                  "values": ["Open Source", "Commercial", "Freemium"]
                },
                "Realtime Collaboration": {
                  "type": "Boolean",
                  "description": "Indicates if the tool supports real-time collaborative features."
                },
                "Live Coding": {
                  "type": "Boolean",
                  "description": "Indicates if the tool supports live coding, essential for live performances and real-time iterative design."
                }
              }
            }            
            `
          },
          {
            "role": "user",
            "content": [
              {
                "type": "text",
                "text": `
                You have to respond by giving an JSON object that fits the given schema and chooses the values that best fit the user requirments for a software item
                User Requirments: ${userPrompt} 
                `
              }
            ]
          }
        ],
        "max_tokens": 1000,
    }
    
    return {headers, payload};
}

module.exports = {
    createFiltersFromPrompt,
    validateHeadersForCors,
    applyCorsHeadersOnRequest
}