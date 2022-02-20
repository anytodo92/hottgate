const config = require('../config')
const { RtmTokenBuilder, RtmRole } = require('agora-access-token');
const agora_app_id = process.env.AGORA_APPID;
const agora_app_certificate = process.env.AGORA_CERT;

exports.getToken = (channel_name, role_name, uint32, expiration) => {
    const expiration_timestamp = Math.floor(Date.now() / 1000) + expiration;
    if (!channel_name || !role_name || !uint32 || !expiration) 
        return null;

    var role;
    switch (role_name) {
        case 'host':
            role = 1
            break;
        case 'audience':
            role = 2
            break;
        default:
            role = 2
    }

    return {
        appId: agora_app_id,
        channel: channel_name,
        uint32: uint32,
        token: RtmTokenBuilder.buildToken(agora_app_id, agora_app_certificate, channel_name, null /* uint32.toString() */, role, expiration_timestamp),
        role: role_name,
        expiration: expiration_timestamp,
    }
}
