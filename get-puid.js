const fetch = require("node-fetch");
//  Search for PUID from User Name
// Prompt User Name Enter
// Gets Username then fetches PUID and stores it in Object

function getPuid(uNameNTag) {
    return new Promise((resolve, reject) => {
        let uName = uNameNTag.split('#')[0], tag = uNameNTag.split('#')[1].toUpperCase();
        fetch(`https://api.henrikdev.xyz/valorant/v1/account/${uName}/${tag}`) // Fetches user name & Gets the PUID
        .then(response => response.json())
        .then(data => {
            var PUID = data.data.puuid;
            resolve(PUID);
        }).catch(err => reject(err));
    }).catch(err => console.log(err));
}

module.exports = { getPuid };