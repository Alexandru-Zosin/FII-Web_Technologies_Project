const validateEmail = (email) => {
    if (!email)
        return false;
    const pattern = /^[a-zA-Z0-9._%+-]{2,30}@[a-zA-Z0-9.-]{2,30}.[a-zA-Z]{2,10}$/;
    return pattern.test(email);
};

const validatePassword = (password) => {
    if (!password)
        return false;
    const pattern = /^[a-zA-Z0-9._%+-]{2,30}$/;
    return pattern.test(password);
}

module.exports = { validateEmail, validatePassword };