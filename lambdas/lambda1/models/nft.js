const config = require('../config')
const graph = require('../database')

exports.getNftHistoryFromAddress = async (address) => {
    /*
    `
            MATCH (nc:NftCollection)<-[rp:PartOf]-(n:Nft { uid: $user_id })<-[ro:Owned]-(e:EthAddress)
            RETURN nc.address as nft_address, n.nft_id, n.nft_url, e.address as eth_address
        `
    */
    const query_data = {
        db: config.db.name,
        query: `
            MATCH (e:EthAddress {address: $address})-[r:Owned]->(n:Nft)
            RETURN e.address, r.since, n.id as nft_id
        `,
        param: { 
            address: address
        }            
    }

    const res = await graph.execQuery(query_data)
    return graph.fetchAll(res)
}

/*&exports.upsertNftTransaction = async (data) => {
    const query_data = {
        db: config.db.name,
        query: `
            MERGE (:NftCollection { address: $nft_address })<-[:PartOf]-(:Nft { id: $nft_id, url: $nft_url })<-[:Owned (since: $timestamp)]-(:EthAddress { address: $eth_address })
        `,
        param: data
    }
    
    const res = await graph.execQuery(query_data)
    return graph.fetchOne(res)
}*/