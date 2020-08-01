require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const bot_token = process.env.BOT_TOKEN;
bot.login(bot_token);


sea = '🟦' // 0
sand = '🟨' // 2
grass = '🟩' // 1
personEmoji = '🧍' // 3
pick = '⛏️'
chest = '💰' // 4
skeleton = '💀' // 5

playingArray = []


bot.on('ready', () => {
    console.log('Bot Ready!')
})

bot.on("message", async msg =>{
    if(msg.author.bot) return;
    if(msg.channel.type === "dm") return;
    if(msg.author.id != '264000015674900481') return;

    let message = msg.content.split(" ")
    let cmd = message[0].toUpperCase()
    let args = message.slice(1)
    let userid = msg.author.id

    if(cmd == "!START") {
        var map;
        var size = 9
        map = generateMap(size, size)
        map = generateBeach(map, size, size)
        let person = spawnAssets(map, size, size, userid)
        person.map = map
        playingArray.push(person)
        map[person.x][person.y] = 3
        for(i = 0; i < person.enemy.length; i++){
            map[person.enemy[i].x][person.enemy[i].y] = 5
        }
        console.log()
        embed = new Discord.MessageEmbed()
                .setDescription(`**You: ${person.y + 1}, ${person.x + 1} \n Chest: ${person.chest.y + 1}, ${person.chest.x + 1} ** \n` + translateMap(map))
                .setTitle('Your Adventure!')

        msg.channel.send(embed).then(message =>{
            message.react('◀️')
            message.react('🔼')
            message.react('🔽')
            message.react('▶️')
            message.react('⛏️')


        })
    }
})

bot.on('messageReactionAdd', async (reaction, user) => {
    if(user.bot) return
    await reaction.users.remove(user.id)

    let message = reaction.message;
    let emoji = reaction.emoji.name
    let isPlaying = false;
    let data;
    let map;
    let index;
    for(i = 0; i < playingArray.length; i++){
        if(playingArray[i].user == user.id) {isPlaying = true; data = playingArray[i]; index = i}
    }

    if(isPlaying){
        if(emoji == '◀️'){
            data.map[data.x][data.y] = data.back
            data.y = data.y - 1
            data.back = data.map[data.x][data.y]
            data.map[data.x][data.y] = 3
        }else if(emoji == '🔼'){
            data.map[data.x][data.y] = data.back
            data.x = data.x - 1
            data.back = data.map[data.x][data.y]
            data.map[data.x][data.y] = 3
        }else if(emoji == '🔽'){
            data.map[data.x][data.y] = data.back
            data.x = data.x + 1
            data.back = data.map[data.x][data.y]
            data.map[data.x][data.y] = 3
        }else if(emoji == '▶️'){
            data.map[data.x][data.y] = data.back
            data.y = data.y + 1
            data.back = data.map[data.x][data.y]
            data.map[data.x][data.y] = 3
        }else if(emoji = '⛏️'){
            if(data.chest.x == data.x && data.chest.y == data.y){
                console.log('Found')
                data.back = 4
            }else console.log('Fail')
        }
        for(i = 0; i < data.enemy.length; i++){
            let relativeX = data.x - data.enemy[i].x
            let relativeY = data.y - data.enemy[i].y
            let move = {x: 0, y: 0}

            if(relativeX > 0) move.x = -1
            else if(relativeX < 0) move.x = 1

            if(relativeY > 0) move.y = -1
            else if(relativeY < 0) move.y = 1

            data.map[data.enemy[i].x][data.enemy[i].y] = data.enemy[i].back //sets new background
            data.enemy[i].back = data.map[data.enemy[i].x + move.x][data.enemy[i].y  + move.y] // stores new background
            data.map[data.enemy[i].x + move.x][data.enemy[i].y  + move.y] = 5 // moves

        }

        embed = new Discord.MessageEmbed()
        .setDescription(`**You: ${data.y + 1}, ${data.x + 1} \n Chest: ${data.chest.y + 1}, ${data.chest.x + 1} ** \n` + translateMap(data.map, data))
        .setTitle('Your Adventure!')
        message.edit(embed)
    }
})

function generateMap(xSize, ySize){
    let map = [];
    // generate Noise Map
    let edgeMap = []
    for(i = 0; i < ySize + 2; i++){
        edgeMap.push(0)
    }
    map.push(edgeMap)

    for(i = 0; i < xSize; i++){
        let yMap = [];
        yMap.push(0)
        for(x = 0; x < ySize; x++){
            yMap.push(Math.round(Math.random()))
        }
        yMap.push(0)
        map.push(yMap)
    }
    map.push(edgeMap)

    //console.log(map)
    //console.log(translateMap(map))

    // polish Map
    var sum = 0;

    for(i = 1; i < xSize + 1; i++){
        for(x = 1; x < ySize + 1; x++){
            let top = map[i-1][x];
            let topRight = map[i-1][x+1]
            let topLeft = map[i-1][x-1]
            let bottom = map[i+1][x];
            let bottomRight = map[i+1][x+1]
            let bottomLeft = map[i+1][x-1]
            let left = map[i][x-1]
            let right = map[i][x+1]
            
            total = top + bottom + left + right;
            totalCorners = topRight + topLeft + bottomRight + bottomLeft;

            if(total == 0) map[i][x] = 0
            else if(total == 1) map[i][x] = 0
            else if(total == 2) {
                if(totalCorners >= 2) map[i][x] = 1 //Math.round(Math.round())
                else if(totalCorners <= 1) map[i][x] = 0
                else if (totalCorners = 2) map[i][x] = Math.round(Math.round())
            }else if(total == 3) map[i][x] = 1
            else if(total == 4) map[i][x] = 1

            sum = sum + map[i][x]
        }
    }

    //console.log(map)
    //console.log(translateMap(map))
    
    if(sum < 15){
        return generateMap(xSize, ySize);
    }else{
        return map;
    }

}

function generateBeach(map, xSize, ySize){
    for(i = 1; i < xSize + 1; i++){
        for(x = 1; x < ySize + 1; x++){
            let top = map[i-1][x];
            let bottom = map[i+1][x];
            let left = map[i][x-1]
            let right = map[i][x+1]
            if(top == 0 ||bottom == 0 || left == 0 || right == 0){
                if(map[i][x] == 1) map[i][x] = 2
            }


        }
    }
    return map
}

function spawnAssets(map, xSize, ySize, userid){
    let info;
    let spawn = []
    console.log(map)
    for(i = 1; i < xSize + 1; i++){
        for(x = 1; x < ySize + 1; x++){
            console.log('-------------------\n' + map[i][x] + " -==-" + grass )
            if(map[i][x] == 1){
                spawn.push({x: i, y: x})
            }
        }
    }

    
    var rand = spawn[Math.round(Math.random() * spawn.length)]
    var chest = spawn[Math.round(Math.random() * spawn.length)]
    var skel = spawn[Math.round(Math.random() * spawn.length)]

    while(rand == skel){
        skel = spawn[Math.round(Math.random() * spawn.length)]
    }

    info = {user: userid,x: rand.x, y: rand.y, back: 1, map: [], 
        chest: {x: chest.x, y: chest.y}, 
        enemy:[{x: skel.x, y: skel.y, alive: true, back: 1}]}

    return info

}

function translateMap(map, person){
    let mapArray = [];
    let mapString = '';
    for(i = 0; i < map.length; i++){
        mapArray.push(map[i].join(' '))
    }
    mapString = mapArray.join('\n')

    mapString = mapString.replace(/0/g, sea)
    mapString = mapString.replace(/1/g, grass)
    mapString = mapString.replace(/2/g, sand)
    mapString = mapString.replace(/3/g, personEmoji)
    mapString = mapString.replace(/4/g, chest)
    mapString = mapString.replace(/5/g, skeleton)

    return mapString
}