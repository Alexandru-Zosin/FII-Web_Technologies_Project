document.getElementById("submit-button").addEventListener('click', async () => {
    const username = document.getElementById("email").value;
    const password = document.getElementById("pass").value;

    const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        mode: "cors", // no-cors, *cors, same-origin
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username,
            password
        }),
    });
    console.log(await response.json());
});