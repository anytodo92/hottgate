const uuid = require('uuid')
const moment = require('moment')
const user_ctrl = require('./user')
const house_model = require('../models/house')

const allowedFields = ['name', 'namelower', 'nftAddress', 'hid']
const changeableFields = ['name', 'nftAddress']

const houseValidationSchema = require('../validation/house').houseValidationSchema;
const setDetailedLogs = require('../validation/house').setDetailedLogs;
setDetailedLogs(true)

exports.dispatch = async (user, params) => {
    switch (params.cmd) {
        case 'get.house':
            return await getHouseListFromUserId(user.uid)
        case 'add.house':
            return await addHouse(
                user.uid,
                params.values.name,
                // req.values.nftAddress,
            )
        case 'enter.house':
            return await getHouseFromUNameAndHName(
                params.values.userName,
                params.values.houseName,
            )
        case 'find.house':
            return await getHouseListFromUserName(params.values.userName)
        default:
            return { ok: false, err: `It is command "${req.cmd}" unknown.` }
    }
}

let getHouseListFromUserId = async (user_id) => {    
    let houses = await house_model.getHouseListFromUserId(user_id, allowedFields)
    let list = []
    houses.forEach((house) => {
        let filtered = {}
        allowedFields.forEach((field) => {
            if (house.hasOwnProperty(field))
                filtered[field] = house[field]
        })

        list.push(filtered)
    })

    return { ok: true, val: list }
}

let getHouseListFromUserName = async (userName) => {
    let user_id = await user_ctrl.getUserIdFromName(userName)
    if (!user_id) 
        return { ok: false, err: 'Could not obtain user by user name.' }

    return await getHouseListFromUserId(user_id)
}

let getHouseFromUNameAndHName = async (user_name, house_name) => {
    let house = await house_model.getHouseFromUNameAndHName(user_name, house_name) 
    
    if (!house)
        return { ok: false, err: 'Could not find by user name and house name.' }
    
    return { ok: true, val: house }
}

let addHouse = async (user_id, house_name, nftAddress) => {
    let house = await house_model.getHouseFromUidAndHName(user_id, house_name)
    
    if (house) {
        return { ok: false, err: 'House name is duplicated.' }
    }

    let is_valid = await houseValidationSchema.isValid({ name: house_name })
    if (!is_valid) {
        return { ok: false, err: 'It is failed to validate house name' }
    }

    let data = {
        user_id: user_id,
        house_id: uuid.v4(),
        name: house_name,
        namelower: housenamelower,
    }

    house = await house_model.upsertHouse(data)
    if (res)
        return { ok: true, val: house }
    else
        return { ok: false, err: 'It is failed to add the house data into db.' }
    // nftAddress: $nftAddress
    // nftAddress: nftAddress,
}