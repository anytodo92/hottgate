const graph = require('../database')
const config = require('../config')

exports.upsertDiscordLinking = async (data) => {
    const query_data = {
        db: config.db.name,
        query: `
            MERGE (u:User {uid: $user_id}-[:Link {created: $created}]->(d:DiscordLinking {
                user_id: $discord_user_id,
                avatar: $avatar,
                verified: verified,
                email: $email,
            }))
            RETURN d
        `,
        param: data
    }

    const res = await graph.execQuery(query_data)
    return graph.fetchOne(res)
}

exports.getDiscordLinking = async (user_id) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (:User {uid: $user_id})-[:Link]->(d:DisordAccount)
            RETURN d
        `,
        param: { user_id: user_id }
    }

    const res = await graph.execQuery(query_data)

    return graph.fetchOne(res)
}

exports.upsertEthereumLinking = async (data) => {
    const query_data = {
        db: config.db.name,
        query: `
            MERGE (u:User {uid: $user_id})-[:Link]->(e:EthereumAddress {address: $address})
            RETURN u.uid, e.address
        `,
        param: data
    }

    const res = await graph.execQuery(query_data)

    return graph.fetchOne(res) 
}

exports.getEtherLinking = async (user_id) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (u:User {uid: $user_id})-[:Link]->(e:EthereumAddress)
            RETURN e
        `,
        param: { user_id: user_id }
    }

    const res = await graph.execQuery(query_data)
    return graph.fetchOne(res)
}

/*exports.upsertKYCIndentity = async (data) => {
    const query_data = {
        db: config.db.name,
        query: `
            MERGE (u:User {sub: $sub})-[r:KYC_IDENTITY_IN]->(ki:Kyc_Indentity {
                address: $address,
                dob: $dob,
                email: $email,
                family_name: $family_name,
                give_name: $given_name,
                phone: $phone,
                selfie_national_id: $selfie_national_id,
                proof_of_addrsss: $proof_of_address,
                selfie: $selfie,
                passport: $passport,
                onfido_service_cert: $onfido_service_cert,
                complyadvantage_service_cert: $complyadvantage_service_cert,
                user_id: $user_id
            })
            RETURN ki
        `,
        param: data
    }

    const res = await graph.execQuery(query_data)
    return graph.fetchOne(res)
}

exports.upsertKYCStatus = async (data) => {
    const query_data = {
        db: config.db.name,
        query: `
            MERGE (u:User {ref_id: $ref_id})-[r:KYC_STATUS_IN {status: $status}]->(ks:Kyc_Status {
                ref_id: $ref_id,
                is_archived: $is_archived,
                block_pass_id: $block_pass_id,
                in_review_date: $in_review_date,
                waiting_date: $waiting_date,
                will_archived_at_date: $will_archive_at_date,
                uid: $user_id
            }) 
            ON CREATE SET r.status = $status, ks.is_archived = $is_archived, ks.in_review_date = $in_review_data,
            ks.waiting_date = waiting_date, ks.will_archived_at_date = $will_archived_at_date
            RETURN ks
        `,
        param: data
    }
    
    const res = await graph.execQuery(query_data)
    return graph.fetchOne(res)    
}*/

exports.getUserIdFromSub = async (sub) => {
    const query_data = {
        db: config.db.name,
        query: `MATCH (auth:Auth {sub: $sub}) -[:LogsIn]-> (user:User)
            RETURN user.uid as uid
        `,
        param: {
            sub: sub,
        }
    }

    const res = await graph.execQuery(query_data)
    
    if (!res || !res.records || !res.records.length) 
        return null

    return res.records[0].get('uid')
}

exports.getUserIdFromDisplayName = async (display_name) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (user:User {displaynamelower: $displaynamelower})
            RETURN user.uid as uid
        `,
        param: { displaynamelower: display_name.toLowerCase() }
    }

    const res = graph.execQuery(query_data)

    if (!res || !res.records || !res.records.length) 
        return null

    return res.records[0].get('uid')
}

exports.getUser = async (user_id) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (user:User {uid: $user_id})
            RETURN user
        `,
        param: {
            user_id: user_id,
        }
    }
    
    const res = await graph.execQuery(query_data)
    let user = graph.fetchOne(res)
    return user
}

exports.upsertUser = async (data) => {
    const query_data = {
        db: config.db.name,
        query: `
            MERGE (auth:Auth {sub: $sub}) -[:LogsIn]-> (user:User {
                sub: $sub,
                uid: $user_id,
                email: $email,
                emailVerified: $emailVerified,
                nickname: $nickname,
                displayname: $displayname,
                displaynamelower: $displaynamelower,
                uint32: $uint32,
                created: $created,
                updated: $updated
            })
        `,
        param: data
    }

    const res = await graph.execQuery(query_data)
    return (res != null)
}

exports.updateUser = async (fields, data) => {
    const query_data = {
        db: config.db.name,
        query: `MATCH (u:User {uid: $user_id}) SET ` + fields.join(', '),
        param: data
    }

    const res = await graph.execQuery(query_data)
    return (res != null)
}

exports.isUniqueUint32 = async (uint32) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (user:User {uint32: $uint32})
            RETURN user.uint32 as uint32
        `,
        param: { uint32: uint32 }
    }

    const res = await graph.execQuery(query_data)
    if (!res) 
        return false

    if (!res.records || !res.records.length) {
        return true
    } 

    return false
}

exports.isUniqueDisplayName = async (user_id, display_name) => {
    let query_data = {
        db: config.db.name,
        query: '',
        param: {
            displayname: display_name.toLowerCase(),
            user_id: user_id
        }
    }
    
    if (user_id === '') {
        query_data.query = `
            MATCH (user:User {displaynamelower: $displayname})
            RETURN user.uid as uid            
        `
    }
    else {
        query_data.query = `
            MATCH (user:User {displaynamelower: $displayname})
            WITH user.uid as uid
            WHERE uid <> $user_id
            RETURN uid
        `
    }

    const res = await graph.execQuery(query_data)
    
    if (!res) 
        return false

    if (!res.records || !res.records.length)
        return true

    return false
}
