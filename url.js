const { get } = require("snekfetch"); 
const { getEmbed_CatImage,
        getEmbed_DogImage } = require('./embedMessages.js');

async function catImage(robot, message, args){
    let res = await get('https://aws.random.cat/meow');
    catURL = res.body.file;
    await message.channel.send(getEmbed_CatImage(catURL));
}

async function dogImage(robot, message, args){
    let res = await get('https://dog.ceo/api/breeds/image/random');
    dogURL = res.body.message;
    await message.channel.send(getEmbed_DogImage(dogURL));
}

module.exports = { 
    catImage,
    dogImage,
}
