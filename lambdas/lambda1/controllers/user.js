const uuid = require('uuid')
const agora = require('../util/agora')
const moment = require('moment')
const crypto = require('crypto')
const auth0 = require('auth0')
const user_model = require('../models/user')
const request = require('request')
const config = require('../config')
const axios = require('axios')

const allowed_fields = ['displayname', 'oncyber', 'opensea', 'metamask']
const profile_fields = ['displayname', 'displaynamelower', 'oncyber', 'opensea', 'metamask', 'uint32']
const visible_fields = ['displayname', 'displaynamelower', 'email', 'nickname', 'metamask', 'oncyber',
    'created', 'modified', 'updates']
const hidden_fields = ['sub', 'uid', 'email', 'emailVerified', 'nickname', 'created', 'updated', 'modified']
const admin_fields = ['groups']

const profileValidationSchema = require('../validation/profile').profileValidationSchema
const setDetailedLogs = require('../validation/profile').setDetailedLogs

setDetailedLogs(true)

exports.dispatch = async (user, params) => {
    switch (params.cmd) {
        case 'change.profile':
            return await changeProfile(user, params)
        case 'get.profile':
            return await getProfile(user, params)
        case 'agls.profile':
            return await getAgoraLiveStreamToken(user, params)
        //case 'kyc.verify':
        //    return await verifyKYC()
        case 'ethereum.link':
            return await createEthereumLinking(user)
        //case 'discord.link':
        //    return await createDiscordLinking(user)
        case 'check.status':
            return await getUserLinkingStatus(user)
        default:
            return { ok: false, err: `It is command "${req.cmd}" unknown.` }
    }
}

exports.getUserIdFromName = async (user_name) => {
    return await user_model.getUserIdFromDisplayName(user_name)
}

exports.getFilteredUser = (user) => {
    let filtered = {}
    visible_fields.forEach((field) => {
        if (user.hasOwnProperty(field)) {
            filtered[field] = user[field]
        }
    })
    return filtered
}

exports.getUser = async (sub) => {
    let managementClient = new auth0.ManagementClient({
        domain: config.auth0.domain,
        clientId: config.auth0.client_id,
        clientSecret: config.auth0.client_secret,
        scope: 'read:users'
    })

    let date = moment().format('YYYY-MM-DD HH:mm:ss,SSS')
    let user_id = await user_model.getUserIdFromSub(sub)
    
    if (user_id) {
        console.log('It is obtained a user by current uid.')
        let user = await user_model.getUser(user_id)
        return user
    } 
    else {
        user_id = uuid.v4()        
        let auth0_user_data = await managementClient.getUser({ id: sub })
        
        const uint32 = await getUniqueUint32()
        const data = {
            sub: sub,
            user_id: user_id,
            email: auth0_user_data.email,
            emailVerified: auth0_user_data.email_verified,
            nickname: auth0_user_data.nickname,
            uint32: uint32,
            created: date,
            updated: date
        }

        let ret = await addUser(data)
        if (ret) {
            let user = await user_model.getUser(user_id)
            return user
        }
        else {
            return null
        }
    }
}

/*let verifyKYC = async (user) => {  
    // TODO: plz check forward the code to validate...  
    const options = {
        url: `https://kyc.blockpass.org/kyc/1.0/connect/${config.BLOCKPASS.client_id}/recordId/${process.env.KYC_RECORD_ID}`,
        method: 'GET',
        headers: {
            'Authorization': `${config.BLOCKPASS.app_id}`
        }
    }

    request(options, function (error, response, body) {
        if (response.staus === 'success') {
            let {status, recordId, refId, isArchived, 
                blockPassID, inreviewDate, waitingDate, 
                willArchiveAtDate} = { ...response.data } 
            
            let params = {
                status: status,
                record_id: recordId,
                ref_id: refId,
                is_archived: isArchived,
                block_pass_id: blockPassID,
                in_review_date: inreviewDate,
                waiting_date: waitingDate,
                will_archive_at_date: willArchiveAtDate,
                user_id: user.uid
            }

            let ret = user_model.upsertKYCStatus(params)
            
            if (ret) {
                if (!isArchived) {
                    // TODO: plz check if the KYC identity and cert will be to save into the metagate db.
                    ret = createKYCIdentity(user)     
                    if (ret) {
                        return { ok: true }
                    }
                    else {
                        return { ok: false, err: 'It is failed to save KYC data into database.' }
                    }
                }
        
                return { ok: true, val: ret }
            }
            else {
                return { ok: false, err: 'Couldn\'t obtain the KYC data from the database.' }
            }    
        }
        else {
            return { ok: false, err: 'It is failed to call the request to the BLOCKPASS api, please try again.' }
        }
    })
}

let createKYCIdentity = (user) => {
    const options = {
        url: `https://kyc.blockpass.org/kyc/1.0/connect/${config.BLOCKPASS.client_id}/recordId/${process.env.KYC_RECORD_ID}`,
        method: 'GET',
        headers: {
            'Authorization': config.BLOCKPASS.app_id
        }
    }
    
    request(options, function (error, response, body) {
        if (response.status === 'success') {
            //let data = response.data

            let { address, dob, email, 
                family_name, given_name, phone, 
                selfie_national_id, proof_of_address, selfie,
                passport } = { ...response.identities }

            let { onfido_service_cert, complyadvantage_service_cert } = { ...response.certs }
            const data = {
                address: address,
                dob: dob,
                email: email,
                family_name: family_name,
                given_name: given_name,
                phone: phone,
                selfie_national_id: selfie_national_id,
                proof_of_address: proof_of_address,
                selfie: selfie,
                passport: passport,
                onfido_service_cert: onfido_service_cert,
                complyadvantage_service_cert: complyadvantage_service_cert,
                user_id: user.uid
            }

            return user_model.upsertKYCIndentity(data)
        }
        else {
            return { ok: false, err: 'It is failed to call the request to the BLOCKPASS api, please try again.' }
        }        
    })    
}*/

exports.createDiscordLinking = async (user, code) => {
    //code = '0WLgxwtmW34OKaWccTIQ1jkZUhPAIN'
    let instance = axios.create({
        baseURL: 'https://discord.com/api/v9/oauth2',
        timeout: 3000,
    })

    try {
        const data = {
            client_id: config.DISCORD.client_id,
            client_secret: config.DISCORD.client_secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: config.DISCORD.redirect_uri
        }
        
        let res = await instance.post('/token', data, { headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        } })

        /*const data = {
            grant_type: 'client_credentials',
            scope: 'identify connections'
        }
        let res = await instance.post('/token', data, { auth: { username: CLIENT_ID, password: CLIENT_SECRET }} )*/
        
        console.log('Discord Access Token: ', res.access_token) 
        let access_token = res.access_token

        res = instance.get('/users/@me', { headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Brearer: ${access_token}`
        } })    
        
        let { discord_user_id, user_name, discriminator, avatar, verified, email,
            flags, banner, accent_color, premium_type, public_flags } = { ...res }
        
        res = instance.get('/users/@me/guilds', { headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Brearer: ${access_token}`
        } })
        guilds_count = res.length

        let data = {
            user_id: user.uid,
            discord_user_id: discord_user_id, 
            //user_name: user_name,
            //discriminator: discriminator,
            avatar: `https://cdn.discordapp.com/avatars/${discord_user_id}/${avatar}.png`,
            verified: verified,
            email: email,
            //flags: flags,
            //banner: banner,
            //accent_color: accent_color,
            //premium_type: premium_type,
            //public_flags: public_flags,
            created: moment.format('YYYY-MM-DD HH:mm:ss,SSS')
        }

        let ret = await user_model.upsertDiscordLinking(data)
        if (ret) {
            return { ok: true, val: ret }
        }
        else {
            return { ok: false, err: 'It is falied to get user data from the Discord.' }
        }
    }
    catch (error) {
        console.log(error)
    }
}

let createEthereumLinking = async (user, address) => {
    const data = {
        address: address,
        user_id: user.uid
    }

    const ret = user_model.upsertEthereumLinking(data)
    if (ret) {
        return { ok: true, val: ret }
    }
    else {
        return { ok: false, err: 'It is failed to link to the Ethereum account.' }
    }
}

let getUserLinkingStatus = async (user) => {
    const have_discord_linking = await user_model.getDiscordLinking(user.uid)
    const have_ether_linking = await user_model.getEtherLinking(user.uid)

    if (!have_ether_linking && !have_discord_linking) {
        return 0
    }
    else if (have_ether_linking && !have_discord_linking) {
        return 1
    }
    else if (have_ether_linking && have_discord_linking) {
        return 2
    }
}

let changeProfile = async (user, params) => {
    let date = moment().format('YYYY-MM-DD HH:mm:ss,SSS')

    if (!params.values) 
        return { ok: false, err: 'No profile data is submitted.' }

    // TODO: plz check the code blow if neccessary to get user from the database again...
    user = await user_model.getUser(user.uid)
    if (!user) 
        return { ok: false, err: 'Could not get user from user id.' }

    let changed_data = {}
    for (key in params.values) {
        let value = String(params.values[key])
        if (allowed_fields.indexOf(key) >= 0 && user[key] !== value) {
            changed_data[key] = value
        }
    }

    if (Object.keys(changed_data).length) {
        let is_valid = await profileValidationSchema.isValid(changed_data)
        if (!is_valid) {
            return { ok: false, err: 'It is failed to validate the profile.' }
        }
        
        if (changed_data.displayname) {
            if (!await user_model.isUniqueDisplayName(user.uid, changed_data.displayname)) {
                return { ok: false, err: '`DisplayName` is not unique.' }
            } 
            else {
                changed_data.displaynamelower = changed_data.displayname.toLowerCase()
            }
        }
        
        let changed_fields = Object.keys(changed_data).join(", ")
        changed_data.modified = date
        changed_data.uid = user.uid

        if (await updateUser(changed_data)) {
            return { ok: true, val: { saved: changed_fields } }
        } 
        else {
            return { ok: false, err: 'Couldn\'t update profile.' }
        }
    } else {
        return { ok: true, val: { saved: 'It is no difference between origin profile and submitted profile.' } }
    }
}

let getProfile = async (user, params) => {
    /*if (!params.values) 
        return { ok: false, err: 'No submitted data(values).' }

    // TODO: plz check if profileid is displayname
    let displayName = params.values.profileId.toLowerCase()
    
    let user_id = await user_model.getUserIdFromDisplayName(displayName)
    if (!user_id) 
        return { ok: false, err: 'Could not obtain user by displayName.' }

    user = await user_model.getUser(user_id)
    if (!user) 
        return { ok: false, err: 'Could not obtain user by user_id.' }*/

    let profile = {}
    profile_fields.forEach(val => { 
        profile[val] = user.hasOwnProperty(val) ? user[val] : ''
    })
    return { ok: true, val: profile }
}

let addUser = async (data) => {
    let display_name = await getUniqueDisplayName(data.nickname)
    if (!display_name) {
        return false
    }

    data.displayname = display_name

    let is_valid = await profileValidationSchema.isValid(data)
    if (!is_valid) {
        return { ok: false, err: 'It is failed to validate user.' }
    }

    data.displaynamelower = display_name.toLowerCase()
    
    let ret = await user_model.upsertUser(data)
    return ret
}

let updateUser = async (data) => {
    if (!data || !data.uid) {
        console.log('Invalid data to be update. It not contains uid.')
        return false
    }

    let fields = []
    for (let k in data) {
        if (k !== 'uid') {
            fields.push(`u.${k} = $${k}`)
        }
    }
    
    let ret = await user_model.updateUser(fields, data)
    return ret
}

const defaultExpiry = 2 * 60 * 60

let getAgoraLiveStreamToken = async (user, params) => {
    if (!params || !params.values) {
        return { ok: false, err: 'No submitted data.' }
    }

    if (!params.values.channel) {
        return { ok: false, err: 'The submitted data not contains the channel.' }
    }

    let token = agora.getToken(req.values.channel, 'host', user.uint32, defaultExpiry)
    if (!token) {
        return { ok: false, err: 'Could not obtain agora token.' }
    }
        
    return { ok: true, val: token }
}

let getUniqueDisplayName = async (nickname) => {
    let is_unique = await user_model.isUniqueDisplayName(0, nickname)
    
    if (is_unique) {
        return nickname
    }
    else {
        // TODO: plz check code blow if it is neccessary.
        let count = 8
        while (count > 8) {
            let display_name = nickname + '-' + randomEnd()
            is_unique = await user_model.isUniqueDisplayName(0, display_name)
            if (is_unique)
                return display_name
            else
                count -= 1
        }
    }

    return null
}

let getUniqueUint32 = async () => {
    let ret = null
    let uint32 = crypto.randomBytes(4).readUInt32BE(0, true)
    
    let bl = await user_model.isUniqueUint32(uint32)
    if (bl) {
        ret = uint32
    } 
    else {
        // TODO: plz check code blow if it is neccessary.
        let count = 8
        while (count > 8) {
            uint32 = crypto.randomBytes(4).readUInt32BE(0, true)
            if (await user_model.isUniqueUint32(uint32)) {
                ret = uint32
            } 
            else {
                count -= 1
            }
        }
    }
    
    return ret
}