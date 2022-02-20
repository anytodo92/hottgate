const DEV_MODE = true

exports.DEV_MODE = DEV_MODE

exports.commands = {
    'hello': 'any',
    'change.profile': 'any',
    'get.profile': 'any',
    'agls.profile': 'any',
    'add.house': 'any',
    'get.house': 'any',
    'enter.house': 'any',
    'find.house': 'any',
    'change.group': 'admin',
    'test.page': 'admin',
    'test.nonsense': 'always fails',
    'test.any': 'any',
}

exports.db = {
    uri: DEV_MODE? 'bolt://localhost:7687/' : 'bolt://172.30.77.160:7687 ',//process.env.NEO4J_URL,
    userid: DEV_MODE? 'neo4j' : 'Chris',//process.env.NEO4J_USER,
    password: DEV_MODE? 'qwer1234' : 'ChrisMeta67%!',//process.env.NEO4J_PASS,
    name: DEV_MODE? 'metagate' : '',
    /*name: {        
        customer: DEV_MODE? 'customer' : 'customer',
        social: DEV_MODE? 'social' : 'social',
        game: DEV_MODE? 'game' : 'game',
        nft: DEV_MODE? 'nft' : 'nft'   
    }*/
}

exports.auth0 = {    
    domain: DEV_MODE? 'dev-tjfhga3m.us.auth0.com' : process.env.AUTH0_DOMAIN,
    client_id: DEV_MODE? '0rhSXWTv2BAJPxbYtG8s4VUOs1ia0S4w' : process.env.AUTH0_CLIENT_ID,
    client_secret: DEV_MODE? 'xhH29bnlL3F5sEzIDtmOa742xpKgFXDl5-62vKllfb3kCMdSOvNm5XdkFL8KP-EA' : process.env.AUTH0_CLIENT_SECRET
}                           

exports.BLOCKPASS = {
    client_id: DEV_MODE? '' : '',
    app_id: DEV_MODE? '' : ''
}

exports.DISCORD = {
    client_id: DEV_MODE? '944160977925058590' : '943174784873795614',
    client_secret: DEV_MODE? 'Paj4OuiKL5cEBjqLjPJUnsBGCk--9n3X' : 'b-LR-PL0BylbBBa4SworBnOn2aC9lZGv',
    redirect_uri: DEV_MODE? 'http://localhost:3000/discord_callback' : ''
}