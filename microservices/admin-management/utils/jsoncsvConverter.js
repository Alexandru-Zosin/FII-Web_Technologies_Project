const csv = require('csvtojson')

async function csvToJson(csvFile) {
    const jsonResult = {};
    const csvSections = csvFile.data.split(/\nTable:/).filter(Boolean); // Split CSV by table sections

    for (const section of csvSections) {
        const [tableNameLine, ...csvLines] = section.trim().split('\n');
        const tableName = tableNameLine.trim().replace(/^table/, '').trim();
        const csvString = csvLines.join('\n');

        const json = await new Promise(async (resolve, reject) => {
            csv({
                noheader: true,
                output: "csv"
            })
                .fromString(csvString)
                .then((res) => {
                    if (res.length > 0) {
                        const keys = res[0]; // First row as keys
                        const jsonResult = res.slice(1).map(row => {
                            const jsonObject = {};
                            row.forEach((value, index) => {
                                jsonObject[keys[index]] = value;
                            });
                            return jsonObject;
                        });
                        resolve(jsonResult);
                    } else {
                        resolve([]);
                    }
                })
        })
        jsonResult[tableName] = json;
    }

    return jsonResult;
}

module.exports = { csvToJson };
