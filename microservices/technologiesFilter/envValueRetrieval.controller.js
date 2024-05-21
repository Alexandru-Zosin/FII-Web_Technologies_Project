const retrieveEnvValue = (key) => {
    return process.env[key];
};

module.exports = {
    retrieveEnvValue
}