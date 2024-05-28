const fs = require('fs');

// Function to read JSON file
function readJSONFile(filePath) {
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData);
}

// Function to merge JSON objects based on id
function mergeJSONObjectsById(objectsArray) {
    const mergedObjects = {};

    objectsArray.forEach(objects => {
        objects.forEach(object => {
            const id = object.id;
            if (!mergedObjects[id]) {
                mergedObjects[id] = { ...object };
            } else {
                mergedObjects[id] = { ...mergedObjects[id], ...object };
            }
        });
    });

    return Object.values(mergedObjects);
}

// Read JSON files
const technologies = readJSONFile('technologies.json');
const technologiesDescriptions = readJSONFile('technologiesDescriptions.json');
const technologiesImages = readJSONFile('technologiesImages.json');

// Merge the JSON objects
const mergedData = mergeJSONObjectsById([technologies, technologiesDescriptions, technologiesImages]);

// Write the merged data to final.json
fs.writeFileSync('final.json', JSON.stringify(mergedData, null, 2), 'utf8');

console.log('Merge completed! Check final.json for the merged data.');
