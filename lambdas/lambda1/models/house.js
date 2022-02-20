const graph = require('../database')
const config = require('../config')

exports.getHouseListFromUserId = async (user_id) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (u:User {uid: $user_id}) -[:OwnsHouse]-> (h:House)
            RETURN h
        `,
        param: { user_id: user_id }
    }
    
    const res = await graph.execQuery(query_data)
    let houses = graph.fetchAll(res)
    return houses
}

exports.getHouseFromUNameAndHName = async (user_name, house_name) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (u:User {displaynamelower: $usernamelower}) -[:OwnsHouse]-> (h:House {namelower: $housenamelower})
            RETURN h
        `,
        param: {
            usernamelower: user_name.toLowerCase(),
            housenamelower: house_name.toLowerCase()
        }
    }

    const res = await graph.execQuery(query_data)
    let house = graph.fetchOne(res)
    return house
}

exports.getHouseFromUidAndHName = async (user_id, house_name) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (u:User {uid: $user_id}) -[:OwnsHouse]-> (h:House {namelower: $housenamelower})
            RETURN h
        `,
        param: {
            user_id: user_id,
            housenamelower: house_name.toLowerCase(),
        }
    }

    const res = await graph.execQuery(query_data)    
    let house = graph.fetchOne(res)
    return house
}

exports.upsertHouse = async (data) => {
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (u:User {uid: $user_id})
            MERGE (u) -[:OwnsHouse]-> (h:House {
                hid: $house_id,
                name: $name,
                namelower: $namelower
            })
            RETURN h
        `,
        param: data
    }

    const res = await graph.execQuery(query_data)
    return graph.fetchOne(res)
}