const { retrieveEnvValue } = require('./envValueRetrieval.controller.js');
const fetch = require('node-fetch');
const url = require('url');
// strategy make 3 requests at maximum and then we stop any requests (basically try 3 times to get a valid message from the ai)
// This is a workaround we need because we dont have a certificate that is not self-signed
// what we do is just to instruct http module in the asks we make to allow the self-signed certifcates as valid certificates
const agent = new (require('https')).Agent({
  rejectUnauthorized: false
});

const applyCorsHeadersOnRequest = async (req, res) => {
    validateHeadersForCors(req, res);
    res.writeHead(204, {
        'Content-Length': '0'
    });
    res.end();
}

const validateHeadersForCors = async (req, res) => {
    const requestOrigin = req.headers.origin;
    console.log(requestOrigin);
    if ('https://localhost' == requestOrigin) {
      console.log('setting here the headers');
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
// here to refix alex
const handleQuery = async (req, res) => {
  validateHeadersForCors(req, res);
  const parsedUrl = url.parse(req.url, true);  
  const query = parsedUrl.query; 
  const prompt = query.prompt; 
  console.log('received erequest', prompt);
  const filtersResponseFromOpenAi = await fetch("https://localhost:3555/extractFilter?prompt=" + encodeURIComponent(prompt), {
    agent,
    method: "GET",
    credentials: 'include',
    mode: "cors",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Origin": "https://localhost:3556",
      "Cookie": req.headers.cookie
    },
  });
  let wasKeyInvalid = filtersResponseFromOpenAi.status == 201;
  // if err dont continue
  const jsonFilters = await filtersResponseFromOpenAi.json();
  const technologiesToServerBack = await fetch("https://localhost:3557/extractTechnologies?jsonFilters=" + encodeURIComponent(JSON.stringify(jsonFilters)),
  {
    agent,
    method: "GET",
    credentials: 'include',
    mode: "cors",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Origin": "https://localhost:3556"
    },
  })
  if (technologiesToServerBack.status != 200)
  {
    res.writeHead(406);
    res.end(JSON.stringify("Error: No technologies that fit the reuqests found"));
    return; 
  }
  const technologies = await technologiesToServerBack.json();
  if (wasKeyInvalid)
    res.writeHead(201, {'Content-Type': 'application/json'});
  else
    res.writeHead(200, {'Content-Type': 'application/json'});
  const response = [];
  for (let tech of technologies)
    response.push(tech);
  res.end(JSON.stringify(response));
};


module.exports = {
  handleQuery,
  validateHeadersForCors,
  applyCorsHeadersOnRequest
}