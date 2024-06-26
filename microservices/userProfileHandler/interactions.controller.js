const {retrieveEnvValue} = require("./envValueRetrieval.controller.js");
const {hashWithKey} = require("./utils/crypting.js");
const mysql = require("mysql");
const fetch = require("node-fetch");
const url = require("url");
// strategy make 3 requests at maximum and then we stop any requests (basically try 3 times to get a valid message from the ai)
// This is a workaround we need because we dont have a certificate that is not self-signed
// what we do is just to instruct http module in the asks we make to allow the self-signed certifcates as valid certificates
const agent = new (require("https").Agent)({
    rejectUnauthorized: false,
});

const applyCorsHeadersOnRequest = async (req, res) => {
    validateHeadersForCors(req, res);
    res.writeHead(204, {
        "Content-Length": "0",
    });
    res.end();
};

const validateHeadersForCors = async (req, res) => {
    const requestOrigin = req.headers.origin;
    console.log(requestOrigin);
    if ("https://localhost" == requestOrigin) {
        console.log("setting here the headers");
        res.setHeader("Access-Control-Allow-Origin", requestOrigin);
        res.setHeader("Access-Control-Allow-Methods", "PATCH, OPTIONS, DELETE, PUT");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        return true;
    } else {
        res.writeHead(403, {"Content-Type": "application/json"});
        res.end(JSON.stringify({error: "Forbidden."}));
        return false;
    }
};

const updatePassword = async (req, res) => {
    // validate that the password is the same as the one in the cookie
    validateHeadersForCors(req, res);
    console.log(req.body);
    const validation = await fetch("https://localhost:3000/validate", {
        // this is the password hashed from the database
        agent,
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "https://localhost:8090",
            Cookie: req.headers.cookie,
        },
        body: JSON.stringify({}),
    });
    const validationJsonPayload = await validation.json();
    const validatedPassword = validationJsonPayload.hashedPassword;
    const userId = validationJsonPayload.userId;
    console.log(validatedPassword);

    const requestJsonPayload = req.body;
    console.log(requestJsonPayload, "json response");
    const confirmPassword = requestJsonPayload.confirmPassword;
    const hashedPassword = hashWithKey(confirmPassword, process.env.HASH_KEY); // the hashed passwrod that the user confirmed with

    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "ReFiUSERS",
    });

    if (validatedPassword == hashedPassword) {
        //
        const newPassword = requestJsonPayload.newPassword;
        const encriptedNewPassword = hashWithKey(newPassword, process.env.HASH_KEY);
        try {
            await new Promise((res, rej) => {
                con.query(
                    `UPDATE users SET password = '${encriptedNewPassword}' WHERE id = ${userId}`,
                    (err, response) => {
                        if (err) rej(err);
                        else res(response);
                    }
                );
            });
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Set-Cookie": [
                    `default=deleted; HttpOnly; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                    `dark_theme=deleted; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                ],
            });
            res.end(JSON.stringify({passwordChanged: true}));
        } catch (e) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({passwordChanged: false}));
        }
        console.log("the password is valid");
    } else {
        res.writeHead(206, {"Content-Type": "application/json"});
        res.end(
            JSON.stringify({
                passwordChanged: false,
                reason: "The password for confirmation is not matching the one of the account",
            })
        );
        console.log("is password is invalid");
    }
};

const updateEmail = async (req, res) => {
    // validate that the password is the same as the one in the cookie
    validateHeadersForCors(req, res);
    console.log(req.body);
    const validation = await fetch("https://localhost:3000/validate", {
        // this is the password hashed from the database
        agent,
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "https://localhost:8090",
            Cookie: req.headers.cookie,
        },
        body: JSON.stringify({}),
    });
    const validationJsonPayload = await validation.json();
    const validatedPassword = validationJsonPayload.hashedPassword;
    const userId = validationJsonPayload.userId;
    console.log(validatedPassword);

    const requestJsonPayload = req.body;
    console.log(requestJsonPayload, "json response");
    const confirmPassword = requestJsonPayload.confirmPassword;
    const hashedPassword = hashWithKey(confirmPassword, process.env.HASH_KEY); // the hashed passwrod that the user confirmed with

    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "ReFiUSERS",
    });

    if (validatedPassword == hashedPassword) {
        const newEmail = requestJsonPayload.newEmail;
        try {
            await new Promise((res, rej) => {
                con.query(`UPDATE users SET email = '${newEmail}' WHERE id = ${userId}`, (err, response) => {
                    if (err) rej(err);
                    else res(response);
                });
            });
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Set-Cookie": [
                    `default=deleted; HttpOnly; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                    `dark_theme=deleted; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                ],
            });
            res.end(JSON.stringify({emailChanged: true}));
        } catch (e) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({emailChanged: false}));
            console.log("the password is valid");
        }
    } else {
        res.writeHead(206, {"Content-Type": "application/json"});
        res.end(
            JSON.stringify({
                emailChanged: false,
                reason: "The password for confirmation is not matching the one of the account",
            })
        );
        console.log("is password is invalid");
    }
};

const updateApiKey = async (req, res) => {
    // validate that the password is the same as the one in the cookie
    validateHeadersForCors(req, res);
    console.log(req.body);
    const validation = await fetch("https://localhost:3000/validate", {
        // this is the password hashed from the database
        agent,
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "https://localhost:8090",
            Cookie: req.headers.cookie,
        },
        body: JSON.stringify({}),
    });
    const validationJsonPayload = await validation.json();
    const validatedPassword = validationJsonPayload.hashedPassword;
    const userId = validationJsonPayload.userId;
    console.log(validatedPassword);

    const requestJsonPayload = req.body;
    console.log(requestJsonPayload, "json response");
    const confirmPassword = requestJsonPayload.confirmPassword;
    const hashedPassword = hashWithKey(confirmPassword, process.env.HASH_KEY); // the hashed passwrod that the user confirmed with

    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "ReFiUSERS",
    });

    if (validatedPassword == hashedPassword) {
        //
        const newKey = requestJsonPayload.newKey;
        try {
            await new Promise((res, rej) => {
                con.query(`UPDATE users SET openaikey = '${newKey}' WHERE id = ${userId}`, (err, response) => {
                    if (err) rej(err);
                    else res(response);
                });
            });
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Set-Cookie": [
                    `default=deleted; HttpOnly; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                    `dark_theme=deleted; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                ],
            });
            res.end(JSON.stringify({keyChanged: true}));
        } catch (e) {
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({keyChanged: false}));
            console.log("the password is valid");
        }
    } else {
        res.writeHead(206, {"Content-Type": "application/json"});
        res.end(
            JSON.stringify({
                keyChanged: false,
                reason: "The password for confirmation is not matching the one of the account",
            })
        );
        console.log("is password is invalid");
    }
};

const validateJsonAgainstSchema = (jsonPayload) => {
  return jsonPayload?.error == false && jsonPayload?.jsonPayload?.apiKey != undefined;
}

const updateApiKeyNoPassword = async (req, res) => {
    // validate that the password is the same as the one in the cookie
    validateHeadersForCors(req, res);
    console.log(req.body);
    const validation = await fetch("https://localhost:3000/validate", {
        // this is the password hashed from the database
        agent,
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "https://localhost:8090",
            Cookie: req.headers.cookie,
        },
        body: JSON.stringify({}),
    });
    const validationJsonPayload = await validation.json();
    const userId = validationJsonPayload.userId;

    const requestJsonPayload = req.body;

    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "ReFiUSERS",
    });

    const isUserSerializationCorrectOnJsonFormat = validateJsonAgainstSchema(requestJsonPayload)
    if (!isUserSerializationCorrectOnJsonFormat)
    {
      res.writeHead(207, {"Content-Type": "application/json"});
      res.end(JSON.stringify({error: true}));
      return;
    }
    const newKey = requestJsonPayload.jsonPayload.apiKey;
    try {
        await new Promise((res, rej) => {
            con.query(`UPDATE users SET openaikey = '${newKey}' WHERE id = ${userId}`, (err, response) => {
                if (err) rej(err);
                else res(response);
            });
        });
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Set-Cookie": [
                `default=deleted; HttpOnly; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                `dark_theme=deleted; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
            ],
        });
        res.end(JSON.stringify({keyChanged: true}));
    } catch (e) {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({keyChanged: false}));
        console.log("the password is valid");
    }
};

const getApiKey = async (req, res) => {
    // validate that the password is the same as the one in the cookie
    validateHeadersForCors(req, res);
    const validation = await fetch("https://localhost:3000/validate", {
        // this is the password hashed from the database
        agent,
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "https://localhost:8090",
            Cookie: req.headers.cookie,
        },
        body: JSON.stringify({}),
    });
    const validationJsonPayload = await validation.json();
    const apiKey = validationJsonPayload.apiKey;

    try {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({error: false, jsonPayload: {apiKey}}));
    } catch (e) {
        res.writeHead(206, {"Content-Type": "application/json"});
        res.end(JSON.stringify({error: true}));
    }
};

const deleteAccount = async (req, res) => {
    // validate that the password is the same as the one in the cookie
    validateHeadersForCors(req, res);
    console.log(req.body);
    const validation = await fetch("https://localhost:3000/validate", {
        // this is the password hashed from the database
        agent,
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Origin: "https://localhost:8090",
            Cookie: req.headers.cookie,
        },
        body: JSON.stringify({}),
    });
    const validationJsonPayload = await validation.json();
    const validatedPassword = validationJsonPayload.hashedPassword;
    const userId = validationJsonPayload.userId;
    console.log(validatedPassword);

    const requestJsonPayload = req.body;
    console.log(requestJsonPayload, "json response");
    const confirmPassword = requestJsonPayload.confirmPassword;
    const hashedPassword = hashWithKey(confirmPassword, process.env.HASH_KEY); // the hashed passwrod that the user confirmed with

    const con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "ReFiUSERS",
    });

    if (validatedPassword == hashedPassword) {
        //
        try {
            await new Promise((res, rej) => {
                con.query(`DELETE FROM users WHERE id = ${userId}`, (err, response) => {
                    if (err) rej(err);
                    else res(response);
                });
            });
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Set-Cookie": [
                    `default=deleted; HttpOnly; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                    `dark_theme=deleted; Path=/; SameSite=None; Secure; expires=Thu, 01 Jan 1970 00:00:00 GMT;`,
                ],
            });
            res.end(JSON.stringify({keyChanged: true}));
        } catch (e) {
            // send an error message
            res.writeHead(200, {"Content-Type": "application/json"});
            res.end(JSON.stringify({keyChanged: false}));
            console.log("the password is valid");
        }
    } else {
        res.writeHead(206, {"Content-Type": "application/json"});
        res.end(
            JSON.stringify({
                keyChanged: false,
                reason: "The password for confirmation is not matching the one of the account",
            })
        );
        console.log("is password is invalid");
    }
};

module.exports = {
    updatePassword,
    updateEmail,
    updateApiKeyNoPassword,
    getApiKey,
    updateApiKey,
    deleteAccount,
    validateHeadersForCors,
    applyCorsHeadersOnRequest,
};
