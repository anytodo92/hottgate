const config = require('./config')
const auth = require('./auth');
const res = require('./util/response')

const user_ctrl = require('./controllers/user')
const house_ctrl = require('./controllers/house')
const nft_ctrl = require('./controllers/nft')

exports.handler = async (event, context) => {
    console.log('event handler', event)
    const result_process = (data) => {
        if (data.ok) {
            return res.success(data.val)
        } else {
            return res.error({ error: data.err })
        }
    }

    // TODO: plz forward check 'condition' statement below ...
    if (!event.requestContext ||
        !event.requestContext.authorizer ||
        !event.requestContext.authorizer.principalId) {
            return res.error({ error: 'User is not authorized now.' })
    } 

    const sub = event.requestContext.authorizer.principalId
    let user = await user_ctrl.getUser(sub)

    if (!user) {
        return res.error({ error: 'It is failed to retrive user info from the database.', sub: sub })
    }

    if (user && user.redirect) {
        return res.success({
            redirect: user.redirect,
            params: user.redirectParams,
        })
    }

    if (!event.queryStringParameters || !event.queryStringParameters.code) {
        // Callback Uri
        code = event.queryStringParameters.code
        return result_process(await user_ctrl.createDiscordLinking(user, code))
    }

    if (!event.body) {
        return res.error({ error: 'The request not contains a body data' })
    }

    let body = event.body
    /*try {
        body = JSON.parse(event.body);
    } catch (error) {
        return res.error({ error: 'The body is not JSON format. Retail: ' + error })
    }*/

    if (!body.cmd) {
        return res.error({ error: 'The body not constains a command.' })
    }

    const command = body.cmd
    if (!config.commands[command]) {
        return res.error({ error: `It is command "${command}" unknown.` })
    }

    // TODO: plz fix forward a code below...
    if (!await auth.process(user, command)) {
        return res.error({ error: 'User is not authorized now.' })
    }

    switch (command) {
        case 'login':
        case 'register':
            const ret = await auth_ctrl.dispatch(body)
            return result_process(ret)
        case 'hello':
            user = user_ctrl.getFilteredUser(user)
            return res.success({ user: user })
        case 'change.profile':
        case 'get.profile':
        case 'agls.profile':
        //case 'kyc.verify':
        //case 'discord.link':
        case 'ethereum.link':
        case 'check.status':
            // TODO: plz fix forward...
            return result_process(await user_ctrl.dispatch(user, body))
        case 'add.house':
        case 'get.house':
        case 'enter.house':
        case 'find.house':
            // TODO: plz fix forward...
            return result_process(await house_ctrl.dispatch(user, body))
        case 'history.nft':
            return result_process(await nft_ctrl.dispatch(user, body))           
        case 'test.any':
            return res.success({ response: 'hello' })
        case 'test.page':
            return res.success({
                sub: sub,
                user: user,
                event: event,
            })
        default:
            return res.error({ error: `It is a command "${cmd}" unkown.`})
    }
}

