const neo4j = require('neo4j-driver')
const config = require('../config')

const settingConfig = {
    connectionTimeout: 3600 * 1000, // default
    maxConnectionPoolSize: 100, // default
    logging: neo4j.logging.console('debug')
}
const driver = neo4j.driver(config.db.uri, 
    neo4j.auth.basic(config.db.userid, config.db.password),
    settingConfig)

exports.execQuery = async (data) => {    
    let session = config.DEV_MODE ? driver.session({ database: data.db }) : driver.session()
    
    try {
        let res = await session.run(data.query, data.param)
        return res
    } 
    catch (error) {
        console.log('=== Query Error ===')
        console.log('It is occurred a error while execute the query.', error)
    } 
    finally {
        session.close()
    }
    return null
}

let filterRecord = (record, keys) => {
    let filtered = {}
    keys.forEach((key) => {
        if (record.hasOwnProperty(key)) {
            filtered[key] = record[key]
        }
    })
    return filtered
}

exports.fetchOne = (res, fields) => {
    if (!res || !res.records || !res.records.length) 
        return null

    if (fields) {
        let val = res.records[0].get(0).properties
        return filterRecord(val, fields)
    } 
    else {
        return res.records[0].get(0).properties
    }
}

exports.fetchAll = (res, fields) => {
    if (!res || !res.records || !res.records.length) 
        return null

    let ret = []
    res.records.forEach((val) => {
        if (!val.properties) {
            val = val.get(0)
        }
        
        if (fields) {
            ret.push(filterRecord(val.propoerties, fields))
        } 
        else {
            ret.push(val.propoerties)
        }
    })

    return ret
}
