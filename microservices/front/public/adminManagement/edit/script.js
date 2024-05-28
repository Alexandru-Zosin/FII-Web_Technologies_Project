const urlParams = new URLSearchParams(window.location.search);
const selectedDb = urlParams.get('db');

var databasesPayload;
var startRow = 1;
var endRow = 10;
const prevButton = document.getElementById('prevPage');
const nextButton = document.getElementById('nextPage');

window.onload = async () => {
    await fetchTable(startRow, endRow);
    renderTable();
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
    row.appendChild(document.createElement('td')); // update button placeholder
    row.appendChild(document.createElement('td')); // delete button placeholder
    tableHeaders.appendChild(row);

    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = '';
    var fetchedRowIndex = 1;
    for (let fetchedRow of Object.values(databasesPayload)) {
        row = document.createElement('tr');
        row.id = fetchedRowIndex++;
        for (let key in fetchedRow) {
            cell = document.createElement('td');
            cell.setAttribute('contenteditable', true);
            cell.textContent = fetchedRow[key];
            row.appendChild(cell);
        }
        addUpdateDeleteButtons(row);

        tableBody.appendChild(row);
    }

    if (startRow > 1) {
        prevButton.style.display = 'block';
    } else {
        prevButton.style.display = 'none';
    }

    if (Object.keys(databasesPayload).length < 10) {
        nextButton.style.display = 'none';
    } else {
        nextButton.style.display = 'block';
    }
}

function mapColumnsToValues(row, buttonsNum) {
    let rowData = {};
    let cells = row.querySelectorAll('td'); // Gasire de noduri via selectori CSS
    let keys = document.querySelectorAll('#tableHeader td');

    cells.forEach((cell, index) => {
        if (index < cells.length - buttonsNum) { // 2: excl. update,delete bts, 1: excl. create btn
            rowData[`${keys[index].textContent}`] = cell.textContent;
        }
    });
    return rowData;
}

async function handleUpdate(row) {
    const oldData = databasesPayload[`${row.id}`];
    const updatedData = mapColumnsToValues(row, 2);
    const data = {
        "old": oldData,
        "updated": updatedData
    };

    const response = await fetch(`https://localhost:3001/${selectedDb}`, {
        method: "PUT",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (response.status === 200) {
        await fetchTable(startRow, endRow);
        renderTable();
        window.alert("Update successful.");
    } else {
        window.alert(`An error has occured: ${await response.json().err}`);
    }
}

async function handleDelete(row) {
    const deletedData = mapColumnsToValues(row, 2);

    const response = await fetch(`https://localhost:3001/${selectedDb}`, {
        method: "DELETE",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(deletedData),
    });

    if (response.status === 200) {
        await fetchTable(startRow, endRow);
        if (Object.keys(databasesPayload).length === 0) {
            prevButton.click();
        }
        renderTable();
        window.alert("Delete successful.");
    } else {
        window.alert(`An error has occured: ${await response.json().err}`);
    }
}

async function handleCreate(row) {
    const createdData = mapColumnsToValues(row, 1);

    const response = await fetch(`https://localhost:3001/${selectedDb}`, {
        method: "POST",
        credentials: 'include',
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(createdData),
    });

    if (response.status === 201) {
        await fetchTable(startRow, endRow);
        renderTable();
        window.alert("Create successful.");
    } else {
        window.alert(`An error has occured.`);
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

        let createCell = document.createElement('td');
        let createButton = document.createElement('button');
        createButton.textContent = 'Create';
        createButton.onclick = createHandler(handleCreate, row);
        createCell.appendChild(createButton);
        row.appendChild(createCell);

        tableBody.appendChild(row);
    }
}

function createHandler(func, row) {
    return function() {
        func(row);
    }
}

async function addUpdateDeleteButtons(row) {
    let updateCell = document.createElement('td');
    let updateButton = document.createElement('button');
    updateButton.textContent = 'Update';
    updateButton.classList.add('update');
    updateButton.onclick = createHandler(handleUpdate, row);
    updateCell.appendChild(updateButton);
    row.appendChild(updateCell);

    let deleteCell = document.createElement('td');
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete');
    deleteButton.onclick = createHandler(handleDelete, row);
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);
}

prevButton.onclick = async () => {
    if (startRow > 1) {
        startRow -= 10;
        endRow -= 10;
        await fetchTable(startRow, endRow);
        renderTable();
    }
};

nextButton.onclick = async () => {
    startRow += 10;
    endRow += 10;
    await fetchTable(startRow, endRow);
    renderTable();
    
    if (Object.keys(databasesPayload).length === 0) {
        prevButton.click();
    }
};

document.getElementById('createRow').addEventListener("click", createRow);
// sau .onclick = ... (DOM 1)