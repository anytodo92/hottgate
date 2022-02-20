const config = require('../config')
const graph = require('../database')
const moment = require('moment')
const nft_model = require('../models/nft')

exports.dispatch = async (user, command) => {
    switch (command) {
        case 'history.nft':
            return await getNftHistoryFromUserId(user)            
        default:
            return { ok: false, err: `It is command "${req.cmd}" unknown.` }
    }
}

let getNftHistoryFromUserId = async (user) => {
    let ret = await nft_model.getNftHistoryFromAddress(user.address)
    if (ret)
        return { ok: true, val: ret }
    else 
        return { ok: false, val: 'Not exist Nft history on the database.' }
}

/*let upsertNftTransaction = async (user_id) => {
    const data = {
        user_id: user_id,
        nft_address: nft_address,
        nft_id: nft_id,
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss,SSS')
    }

    let ret = nft_model.upsertNftTransaction(data)
    if (ret) 
        return { ok: true, val: ret }
    else 
        return { ok: false, err: 'It is failed to save Nft data into the databse.' }
}*/