const { retrieveEnvValue } = require('./envValueRetrieval.controller.js');
const fetch = require('node-fetch');
const url = require('url');
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

const createFiltersFromPrompt = async (req, res) => {
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

    const responseJsonPayload = await response.json();
    console.log(responseJsonPayload)
    // if we manage to valide it the received json then we are on the track to respond with it
    const isJSONValid = true; // later the validation here
    if (isJSONValid) {
        res.writeHead(200, {'Content-Type': 'application/json', });
        res.end(responseJsonPayload?.choices[0]?.message?.content); 
    } else {
        res.writeHead(405);
        res.end(JSON.stringify({message: "AI generation has failed multiple times, aborting"}));
    }
};

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
            "content": `Respond with a JSON object that validates the following schema: 
            {
              "version": "1.0",
              "attributes": {
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
                "Rendering": {
                  "type": "Array of Strings",
                  "description": "Types of rendering technology supported.",
                  "values": ["WebGL", "Metal", "Canvas", "SVG", "Vulkan", "DirectX", "OpenGL", "WebGL2"]
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
                "Interactivity": {
                  "type": "Boolean",
                  "description": "Specifies if the tool is geared towards or supports interactive media creation."
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