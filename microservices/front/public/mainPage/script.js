document.getElementById('submitButton').addEventListener('click', async () => {
    const userPrompt = document.getElementById('inputText').value;
    const response = await fetch("https://localhost:3555/extractFilter?prompt=" + encodeURIComponent(userPrompt), {
        method: "GET",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });

})