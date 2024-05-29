const { retrieveEnvValue } = require('./envValueRetrieval.controller.js');
const { avjValidateJSONStructure } = require('./ajvvalidator.controller.js');
const fetch = require('node-fetch');
const url = require('url');
const mysql = require('mysql');

const agent = new (require('https')).Agent({
    rejectUnauthorized: false
});

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
    if ('https://localhost:3556' == requestOrigin) { // this is the origin of the middleware service between frontend and openai
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

// here to refix

const createFiltersFromPrompt = async (req, res) => {
    validateHeadersForCors(req, res); // in order to add the headers to the response for the cors

    const validation = await fetch("https://localhost:3000/validate", { // this is how we get acces to the api key
        agent,
        method: "POST",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Origin": "https://localhost:3555",
            "Cookie": req.headers.cookie
        },
        body: JSON.stringify({})
    });

    if (validation.status !== 200) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: "User credentials invalid. Method not allowed" }));
    }

    const validationJsonPayload = await validation.json();

    const parsedUrl = url.parse(req.url, true);  // `true` parses the query string into an object
    const query = parsedUrl.query;  // This contains the parsed query string as an object
    const prompt = query.prompt;
    let gptVersion = validationJsonPayload.openAiKey != undefined && validationJsonPayload?.openAiKey?.length != 0 ? 4 : 3.5;
    let openAiKey = gptVersion == 4 ? validationJsonPayload.openAiKey : retrieveEnvValue('OPEN_AI_KEY');
    let keyWasInvalid = false;
    let openAiAskAction = constructAskFromPrompt(prompt, openAiKey, gptVersion);

    for (let tryNumber = 1; tryNumber <= MAXMIMUM_NUMBER_OF_TRIES; ++tryNumber) {
        try {

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: 'POST',
                headers: openAiAskAction.headers,
                body: JSON.stringify(openAiAskAction.payload)
            })

            const responsejson = await response.json();
            if (responsejson?.error?.code == 'invalid_api_key') {
                throw new Error('InvalidApiKey');
                continue;
            }
            const responseJsonPayload = JSON.parse(responsejson.choices[0].message.content);
            console.log(responseJsonPayload)
            // if we manage to valide it the received json then we are on the track to respond with it
            const isJSONValid = avjValidateJSONStructure(responseJsonPayload); // later the validation here

            if (isJSONValid) {
                console.log('found a valid json');
                if (keyWasInvalid == true)
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                else
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(responseJsonPayload));
                return;
            } // else we should just continue since the incrementation is done automatically
        } catch (error) {
            console.error("Error in open ai microservice while fetching the response -> ", error);
            if (error.message == 'InvalidApiKey') {
                tryNumber = 0;
                gptVersion = 3.5;
                openAiKey = retrieveEnvValue('OPEN_AI_KEY');
                keyWasInvalid = true
                openAiAskAction = constructAskFromPrompt(prompt, openAiKey, gptVersion);
            }
        }
    }
    res.writeHead(405);
    res.end(JSON.stringify({ message: "AI generation has failed multiple times, aborting" }));
};

const constructAskFromPrompt = (userPrompt, api_key, gptVersion) => {
    headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${api_key}`
    }

    payload = {
        "model": gptVersion == 4 ? 'gpt-4-1106-preview' : 'gpt-3.5-turbo-1106',
        "response_format": { "type": "json_object" },
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

    return { headers, payload };
}

module.exports = {
    createFiltersFromPrompt,
    validateHeadersForCors,
    applyCorsHeadersOnRequest
}