const config = require('../config')

exports.process = async (user, command) => {
    if (!user.uid) {
        console.log('Authorize: Invalid user.')
        return false
    }

    if (!command) {
        console.log('Authorize: Invalid command.')
        return false
    }

    if (!config.commands[command]) {
        console.log(`Authorize: It is a command "${command}"  unknown.`)
        return false
    }

    if (config.commands[command] === "any") {
        return true
    }

    let user_groups = user.group.split(",")
    if (!user_groups || !user_groups.length) {
        console.log('Authorize: User don\'t have any group.')
        return false
    }

    let func_groups = config.commands[command].split(',')
    for (let user_group of user_groups) {
        for (let func_group of func_groups) {
            if (user_group === func_group) {
                return true
            }
        }
    }

    console.log('Authorize: It is a impossible to authorize a user')
    return false
}