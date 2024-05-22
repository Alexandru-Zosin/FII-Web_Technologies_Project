window.onload = async () => {
    const response = await fetch("https://localhost:3001/dashboard", {
        method: "GET",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });

    var databasesPayload;
    if (response.status === 200) {
        databasesPayload = await response.json();
    } else {
        window.alert("An error has occured.");
    }

    const dbSelector = document.getElementById("option");
    dbSelector.innerHTML = "";
    for (var value of Object.values(databasesPayload)) {
        var option = document.createElement("option");
        option.text = value;
        dbSelector.add(option);
    }
}


/*
window.onload = () => {
    document.getElementById("option").addEventListener("change", function(event) {
        console.log('event', event);
        const selectedOption = event.target.value;
        console.log("Selection changed to: " + selectedOption);
        const elementToChange = document.getElementById('changeableForm');
        if (selectedOption == 'email')
            elementToChange.innerHTML = mapChangeTypeToHtml['newEmail'];
        else if (selectedOption == 'password')
            elementToChange.innerHTML = mapChangeTypeToHtml['newPassword'];
        else if (selectedOption == 'apiKey')
            elementToChange.innerHTML = mapChangeTypeToHtml['newOpenAiToken'];
        // You can perform any additional actions needed when the selection changes here
    });
}

document.getElementById('submit').addEventListener('click', async (e) => {
    e.preventDefault();
    const option = document.getElementById('option').value;
    const confirmPassword = document.getElementById('confirmCurrentPassword').value;
    if (option == 'password') {
        const newPassword = document.getElementById('pass').value;
        const response = await fetch("https://localhost:8090/account/password", {
            method: "PATCH",
            credentials: 'include', // https://reqbin.com/code/javascript/lcpj87js/javascript-fetch-with-credentials
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newPassword,
                confirmPassword
            }),
        });
        const responseJsonPayload = await response.json();
        if (response.status == 206)
            window.alert('Wrong Password')
        else if (response.status == 200)
            window.location.href = '/login/index.html'
        console.log(resposne.status, responseJsonPayload)
    }
    else if (option == 'email') {
        const newEmail = document.getElementById('email').value;
        const response = await fetch("https://localhost:3000/account/email", {
            method: "PATCH",
            credentials: 'include', // https://reqbin.com/code/javascript/lcpj87js/javascript-fetch-with-credentials
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newEmail,
                confirmPassword
            }),
        });
        const responseJsonPayload = await response.json();
        console.log(resposne.status, responseJsonPayload)
    }
    else if (option == 'apiKey') {
        const newKey = document.getElementById('openAiKey').value;
        const response = await fetch("https://localhost:3000/account/apiKey", {
            method: "PATCH",
            credentials: 'include', // https://reqbin.com/code/javascript/lcpj87js/javascript-fetch-with-credentials
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                newKey,
                confirmPassword
            }),
        });
        const responseJsonPayload = await response.json();
        console.log(resposne.status, responseJsonPayload)
    }
})*/