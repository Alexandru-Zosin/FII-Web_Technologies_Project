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

const mapChangeTypeToHtml = {
    'newEmail': `<div class="form-group" id='changeableForm'><label for="email">New Email</label><br><input type="text" id="email" name="email" placeholder="email@example.com"><br></div>`,
    'newPassword': `<div class="form-group" id='changeableForm'><label for="pass">New password</label><br><input type="password" id="pass" name="pass"><br></div>`,
    'newOpenAiToken': `<div class="form-group" id='changeableForm'><label for="openAiKey">OpenAI token</label><br><input type="text" id="openAiKey" name="openAiKey"><br></div>`
}

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
        {
            window.alert('The data was changed successfully.');
            window.location.href = '/login/index.html'
        }
        console.log(resposne.status, responseJsonPayload)
    }
    else if (option == 'email') {
        const newEmail = document.getElementById('email').value;
        const response = await fetch("https://localhost:8090/account/email", {
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
        console.log(response.status, responseJsonPayload)
        if (response.status == 206)
            window.alert('Wrong Password')
        else if (response.status == 200)
        {
            window.alert('The data was changed successfully.');
            window.location.href = '/login/index.html'
        }
    }
    else if (option == 'apiKey') {
        const newKey = document.getElementById('openAiKey').value;
        const response = await fetch("https://localhost:8090/account/apikey", {
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
        if (response.status == 206)
            window.alert('Wrong Password')
        else if (response.status == 200)
        {
            window.alert('The data was changed successfully.');
            window.location.href = '/login/index.html'
        }
        console.log(response.status, responseJsonPayload)
    }
})

document.getElementById('deleteAccount').addEventListener('click', () => {
    // Display the modal
    document.getElementById('deleteAccountModal').style.display = 'flex';
});

document.getElementById('cancelDelete').addEventListener('click', () => {
    // Hide the modal
    document.getElementById('deleteAccountModal').style.display = 'none';
});

document.getElementById('confirmDelete').addEventListener('click', async () => {
    const password = document.getElementById('confirmPassword').value;

    if (password) {
        // Password has been entered, proceed with deletion
        // Here, you would typically send the password to your server for validation and to initiate the deletion
        console.log('User confirmed deletion with password:', password);

        const response = await fetch("https://localhost:8090/account", {
            method: "DELETE",
            credentials: 'include', // https://reqbin.com/code/javascript/lcpj87js/javascript-fetch-with-credentials
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                confirmPassword: password
            }),
        });
        const responseJsonPayload = await response.json();
        if (response.status == 206)
            window.alert('Wrong Password')
        else if (response.status == 200)
        {
            window.alert('Account deletion, we are sorry you have to leave us :(.');
            window.location.href = '/login/index.html'
        }
        console.log(response.status, responseJsonPayload)
        // Perform the deletion (you can replace this part with your actual deletion logic)
    } else {
        alert('Please enter your password.');
    }
});

document.getElementById('exportData').addEventListener('click', async () => {
    try {
        const response = await fetch("https://localhost:8090/account/apikey", {
            method: "GET",
            credentials: 'include', // For sending cookies and authentication data
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const jsonPayload = await response.json();

        // Prepare the data to be downloaded as JSON
        const dataStr = JSON.stringify(jsonPayload);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        // Create a dynamic link element and trigger the download
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'exportedData.json');
        linkElement.click();

    } catch (error) {
        console.error('Error fetching or downloading data:', error);
    }
});

document.getElementById('importData').addEventListener('click', () => {
    const fileInput = document.getElementById('importFile');
    fileInput.click();  // Simulate click on the hidden file input

    fileInput.onchange = async () => {
        const file = fileInput.files[0];

        if (file && file.type === "application/json") {
            try {
                const reader = new FileReader();

                reader.onload = async (e) => {
                    const text = e.target.result;
                    const data = JSON.parse(text);
                    console.log('JSON data read from file:', data);

                    const response = await fetch("https://localhost:8090/account/apikey", {
                        method: "PUT",
                        credentials: 'include', // https://reqbin.com/code/javascript/lcpj87js/javascript-fetch-with-credentials
                        mode: "cors",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            ...data
                        }),
                    });

                    const responseJsonPayload = await response.json();
                    if (response.status == 200)
                    {
                        window.alert('The data was changed successfully.');
                        window.location.href = '/login/index.html'
                    }
                    else if (response.status == 207)
                        window.alert('The provided json object does not validate the normal schema. Make sure you submit the correct file');
                    console.log(response.status, responseJsonPayload)
                };

                reader.readAsText(file);
            } catch (error) {
                console.error('Error reading the JSON file:', error);
            }
        } else {
            console.error('Please upload a valid JSON file.');
        }
    };
});