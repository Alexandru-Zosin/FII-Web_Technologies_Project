document.getElementById('logout').addEventListener('click',async () => {
    const response = await fetch("https://localhost:3000/logout", {
        method: "POST",
        credentials: 'include', // https://reqbin.com/code/javascript/lcpj87js/javascript-fetch-with-credentials
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });

    window.location.href = 'https://localhost/login/index.html';
})