const axios = require('axios');

exports.test1 = async () => {
    console.log('test1');
    var ax = axios.create({
        baseURL: 'https://api.ipify.org/',
        timeout: 3000,
    });
    try {
        res = await ax.get('/');
        return res.data;
    } catch (error) {
        return "error " + error;
    }
}