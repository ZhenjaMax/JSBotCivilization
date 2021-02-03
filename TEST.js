const cars = await Car.findAll({ 
    where: {
        userId: { [Op.in]: myUserIds }, // userId   IN      [2, 3, 4]       (myUserIds = [2, 3, 4])
        action: 'start',                // action   IS      "start"
        sellDate: { [Op.not]: null },   // sellDate IS      NOT NULL
        status: { [Op.is]: null, }      // status   IS      NULL
    },
    order: [ ['id', 'DESC'] ],          // Like: ORDER BY id DESC
    limit: 5, 
    offset: 1
});

const cars = await Car.findAll( {where: { userid: { [Op.not]: null }}} );