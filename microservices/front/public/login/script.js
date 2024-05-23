document.getElementById("submit-button").addEventListener('click', async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    const response = await fetch("https://localhost:3000/login", {
        method: "POST",
        credentials: 'include', // https://reqbin.com/code/javascript/lcpj87js/javascript-fetch-with-credentials
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password
        }),
    });

    if (response.status === 200) {
        window.location.href = "https://localhost/mainPage/index.html";
    } else {
        window.alert("Login failed.");
    }
});

window.onload = async () => {
    const response = await fetch("https://localhost:3000/validate", {
        method: "POST",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });

    if (response.status === 200) {
        window.location.href = "https://localhost/mainPage/index.html";
    }
};