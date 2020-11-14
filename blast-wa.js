var mysql = require('mysql');
const fs = require('fs');
const { Client, Location } = require('./index');
const SESSION_FILE_PATH = './session.json';
let sessionCfg;
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:'dpra'
});


if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}
const client = new Client({ puppeteer: { headless: false }, session: sessionCfg });
client.initialize();

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

db.connect(function(err) {
    if (err) throw err;
    
    let sql = "SELECT * FROM wa";
    db.query(sql, function (err, result) {
        if (err) throw err;
        result.forEach(no => {
            client.on('ready', () => {
                client.sendMessage('6281295085xxx@c.us', `nomor : ${no.nomor} group #${no.group}`,);
            });
        });
    });
});