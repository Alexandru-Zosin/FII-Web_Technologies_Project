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