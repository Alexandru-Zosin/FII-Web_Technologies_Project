const urlParams = new URLSearchParams(window.location.search);
const selectedDb = urlParams.get('db');
console.log(selectedDb);

window.onload = async () => {
    var startRow = 1;
    var endRow = 10;
    const response = await fetch(`https://localhost:3001/${selectedDb}?startRow=${startRow}&endRow=${endRow}`, {
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

    for (key in databasesPayload["1"])
        console.log(key);
}