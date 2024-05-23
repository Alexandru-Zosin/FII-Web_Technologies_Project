const urlParams = new URLSearchParams(window.location.search);
const selectedDb = urlParams.get('db');
console.log(selectedDb);

var databasesPayload;
var startRow = 1;
var endRow = 10;

window.onload = async () => {
    await fetchTable(startRow, endRow);
    renderTable();
    setupPaginationControls();
}

async function fetchTable(startRow, endRow) {
    const response = await fetch(`https://localhost:3001/${selectedDb}?startRow=${startRow}&endRow=${endRow}`, {
        method: "GET",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    });

    if (response.status === 200) {
        databasesPayload = await response.json();
    } else {
        window.alert("An error has occured.");
    }
}

function createHandler(func, row) {
    return function() {
        func(row);
    }
}

function handleUpdate(row) {
    let rowData = {};
    let cells = row.querySelectorAll('td');

    cells.forEach((cell, index) => {
        if (index < cells.length - 2) { // exclude update and delete buttons
            rowData[`column${index + 1}`] = cell.textContent;
        }
    });
    console.log(rowData);
    // Send a POST or PUT request with rowData
}

function handleDelete(row) {
    let rowData = {};
    let cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
        if (index < cells.length - 2) {
            rowData[`column${index + 1}`] = cell.textContent;
        }
    });
    console.log(rowData);

    /*
     // fetch(`https://localhost:3001/delete`, {
    //     method: 'DELETE',
    //     credentials: 'include',
    //     mode: 'cors',
    //     headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(rowData),
    // }).then(response => {
    //     if (response.status === 200) {
    //         row.remove();
    //     } else {
    //         window.alert('An error has occurred.');
    //     }
    // });
    */
    row.remove();
    //location.reload();
}

function addUpdateDeleteButtons(row) {
    let updateCell = document.createElement('td');
    let updateButton = document.createElement('button');
    updateButton.textContent = 'Update';
    updateButton.onclick = createHandler(handleUpdate, row);
    updateCell.appendChild(updateButton);
    row.appendChild(updateCell);

    let deleteCell = document.createElement('td');
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = createHandler(handleDelete, row);
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);
}

function renderTable() {
    var row, cell;
    const tableHeaders = document.getElementById("tableHeader");
    tableHeaders.innerHTML = '';
    row = document.createElement('tr');
    for (let column in databasesPayload["1"]) {
        cell = document.createElement('td');
        cell.textContent = column;
        row.appendChild(cell);
    }
    row.appendChild(document.createElement('td')); // update button
    row.appendChild(document.createElement('td')); // delete button
    tableHeaders.appendChild(row);

    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = '';
    for (let fetchedRow of Object.values(databasesPayload)) {
        row = document.createElement('tr');
        for (let key in fetchedRow) {
            cell = document.createElement('td');
            cell.setAttribute('contenteditable', true);
            cell.textContent = fetchedRow[key];
            row.appendChild(cell);
        }
        addUpdateDeleteButtons(row);

        tableBody.appendChild(row);
    }
}

function createRow() {
    const tableBody = document.getElementById("tableBody");
    if (document.querySelectorAll('#tableBody .new-row').length === 0) {
        let row = document.createElement('tr');
        row.classList.add('new-row');

        for (let i = 0; i < Object.keys(databasesPayload["1"]).length; i++) {
            let cell = document.createElement('td');
            cell.setAttribute('contenteditable', true);
            cell.textContent = '/'
            row.appendChild(cell);
        }
        addUpdateDeleteButtons(row);

        tableBody.appendChild(row);
    }
}

async function updatePaginationButtons(prevButton, nextButton) {
    if (startRow > 1) {
        prevButton.style.display = 'block';
    } else {
        prevButton.style.display = 'none';
    }

    await fetchTable(startRow, endRow);
    if (Object.keys(databasesPayload).length < 10) {
        nextButton.style.display = 'none';
    } else {
        nextButton.style.display = 'block';
    }
    renderTable();
}

function setupPaginationControls() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    prevButton.onclick = async () => {
        if (startRow > 1) {
            startRow -= 10;
            endRow -= 10;
            await updatePaginationButtons(prevButton, nextButton);
        }
    };

    nextButton.onclick = async () => {
        startRow += 10;
        endRow += 10;
        await updatePaginationButtons(prevButton, nextButton);
    };

    prevButton.style.display = 'none';
    if (Object.keys(databasesPayload).length < 10)
        nextButton.style.display = 'none';
}

document.getElementById('createRow').addEventListener("click", createRow);