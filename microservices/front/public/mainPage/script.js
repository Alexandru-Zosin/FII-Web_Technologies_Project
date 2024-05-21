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
    if (response.status != 200)
    {
        htmlString = `<p>
        <span>
            <img class="icon" alt="resource" src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png">
            </span>
            <strong>${responseJsonPayload}</strong>
        </p>`
    }
    else
    // check if there is no error
        htmlString = responseJsonPayload.map(resource =>
            `<p>
                <span>
                    <img class="icon" alt="resource" src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png">
                    </span>
                    <strong><a href=${resource.url}>${resource.name}</a></strong>: 
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
                    aliquip ex ea commodo consequat.
            </p>`
        ).join(" ");    
    document.getElementById('answer').innerHTML = htmlString;
    loader.style.display = 'none';
})

window.onload = () => {
    loader = document.getElementsByClassName('loader')[0];
    loader.style.display = 'none';
}