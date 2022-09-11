const fetch = require("node-fetch"),
    { MessageEmbed } = require("discord.js"),
    { MongoClient } = require("mongodb"),
    dbclient = new MongoClient(process.env.DATABASECONNECTION);

//  Search for PUID from User Name
// Prompt User Name Enter
// Gets Username then fetches PUID and stores it in Object

async function getPuid(uNameNTag) {
    return new Promise((resolve, reject) => {
        let uName = uNameNTag.split("#")[0],
            tag = uNameNTag.split("#")[1].toUpperCase();
        fetch(`https://api.henrikdev.xyz/valorant/v1/account/${uName}/${tag}`) // Fetches user name & Gets the PUID
            .then((response) => response.json())
            .then((data) => {
                if(data) {
                    let PUID = data.data.puuid;
                    resolve(PUID);
                } else {
                    throw new Error('No user found.')
                }
            })
            .catch((err) => {
                console.error("error occured while fetching ", err);
                reject(err)
            });
    }).catch((err) => console.error(err));
}

function createEmbed(name, fields, timestamp) {
    const embed = new MessageEmbed()
        .setColor("#FDDA0D")
        .setTitle(`Stats for ${name}`)
        .setDescription("For the past 5 games.")
        .addFields(fields);
    if (timestamp) {
        embed.setTimestamp();
    }

    return embed;
}
async function getUserDB(guild, user) {
    return dbclient.db("Valorant-Bot").collection(guild).findOne({
        id: user,
    });
}

function returnUser(PUID) {
    return new Promise((resolve, reject) => {
        let kills = 0,
            assists = 0,
            deaths = 0,
            winRate,
            finalKDA,
            currentTier;
        fetch(`https://api.henrikdev.xyz/valorant/v3/by-puuid/matches/na/${PUID}`)
            .then((response) => response.json())
            .then((data) => {
                let totalWon = 0;
                try {
                    if (data.status === 200) {
                        data.data.forEach((match) => {
                            // KDA
                            match.players.all_players.forEach((element) => { // iiterates through all players's to find
                                if (element.puuid === PUID) {
                                    team = element.team;
                                    currentTier = element.currenttier_patched;
                                    kills = element.stats.kills;
                                    deaths = element.stats.deaths;
                                    assists = element.stats.assists;
                                }
                            });
                            if (match.teams[`${team.toLowerCase()}`].has_won) {
                                totalWon++;
                            }
                        });
                        winRate = totalWon / data.data.length;
                        finalKDA = (kills + assists) / deaths;
                        resolve({
                            wr: winRate,
                            kda: Number(finalKDA.toFixed(2)),
                            tier: currentTier,
                        });
                    } else {
                        resolve(new Error('Error retrieving data'))
                    }
                } catch (error) {
                    console.error('error occured in getUserData', error);
                }
            })
            .catch((error) => {
                console.error("Had error fetching matches:", error);
            });
    });
}


function getMMR(PUID) {
	return new Promise((resolve, reject) => {
		fetch(`https://api.henrikdev.xyz/valorant/v2/by-puuid/mmr/na/${PUID}`)
			.then((response) => response.json())
			.then((data) => {
				var log = data.data.current_data;
				// console.log(log);
				resolve({ 'current_rank': log.currenttierpatched, 'mmr_change': log.mmr_change_to_last_game, 'current_elo': log.elo });
			}).catch(err => {
                console.error('getMRR error: ', err);
                if(err.toString().includes('TypeError')) {
                    reject('*Error Unknown Username*')
                }
            })
	})
}

async function connectDB() {
    await dbclient.connect();
}

async function closeDB() {
    await dbclient.close();
}

module.exports = {
    getPuid,
    createEmbed,
    getUserDB,
    dbclient,
    connectDB,
    closeDB,
    returnUser,
    getMMR
};
