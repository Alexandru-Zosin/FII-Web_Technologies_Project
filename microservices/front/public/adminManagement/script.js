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

    const dbSelector = document.getElementById("dbselect");
    dbSelector.innerHTML = "";
    for (var value of Object.values(databasesPayload)) {
        var option = document.createElement("option");
        option.text = value;
        dbSelector.add(option);
    }
}

document.getElementById("edit").addEventListener("click", (event) => {
    event.preventDefault();
    const selectedDb = document.getElementById("dbselect").value;
    window.location.href = `./edit/index.html?db=${encodeURIComponent(selectedDb)}`;
});

document.getElementById('exportData').addEventListener('click', async () => {
    try {
        const response = await fetch("https://localhost:3001/resources", {
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
        const dataStr = JSON.stringify(jsonPayload);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        // create a dynamic link element and trigger the download
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

                    const response = await fetch("https://localhost:3001/resources", {
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