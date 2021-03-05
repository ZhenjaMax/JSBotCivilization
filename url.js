const { get } = require("snekfetch"); 
const { getEmbed_CatImage,
        getEmbed_DogImage,
        getEmbed_Error } = require('./embedMessages.js');

async function catImage(robot, message, args){
    try{
        let res = await get('https://aws.random.cat/meow');
        catURL = res.body.file;
        return await message.channel.send(getEmbed_CatImage(catURL));
    } catch(errorCatImage) {
        return await message.channel.send(getEmbed_Error("errorCatImage"));
    }
}

async function dogImage(robot, message, args){
    try{
        let res = await get('https://dog.ceo/api/breeds/image/random');
        dogURL = res.body.message;
        return await message.channel.send(getEmbed_DogImage(dogURL));
    } catch(errorDogImage) {
        return await message.channel.send(getEmbed_Error("errorDogImage"));
    }
}

module.exports = { 
    catImage,
    dogImage,
}
