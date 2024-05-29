var loader;
document.getElementById('submitButton').addEventListener('click', async () => {
    loader.style.display = 'block';
    const userPrompt = document.getElementById('inputText').value;
    const response = await fetch("https://localhost:3556/generateTechnologies?prompt=" + encodeURIComponent(userPrompt), {
        method: "GET",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });
    const responseJsonPayload = await response.json();
    let htmlString
    if (response.status != 200 && response.status != 201)
    {
        htmlString = `<p>
            <strong>${responseJsonPayload}</strong>
        </p>`
    }
    else
    // check if there is no error
        htmlString = responseJsonPayload.map(resource =>
            `<p>
                <span>
                    <img class="icon" alt="resource" src="${resource.favicon}">
                    </span>
                    <strong><a href=${resource.url} target='_blank'>${resource.name}</a></strong>: 
                    ${resource.description}
            </p>`
        ).join(" ");    
        document.getElementById('answer').innerHTML = htmlString;
        loader.style.display = 'none';
        if (response.status == 201)
            window.alert("The key was not valid, fallback to gpt 3.5");
})

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

    if (response.status !== 200) {
        window.location.href = "https://localhost/login/index.html";
    }

    loader = document.getElementsByClassName('loader')[0];
    loader.style.display = 'none';
}