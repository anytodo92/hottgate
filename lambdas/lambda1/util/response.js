exports.success = function (data) {
    if (data) {
        data.status = 'ok'
    }
    else {
        data = { status: 'ok' }
    }

    let response = {
        statusCode: 200,
        headers: {
            'Access-Controll-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: data
    }

    return response
}

exports.error = (data) => {
    if (data) {
        data.status = 'failed'
    }
    else {
        data = { status: 'failed' }
    }

    let response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        isBase64Encoded: false,
        /*multiValueHeaders: {
            'X-Custom-Header': ['value', 'other value']
        }*/
        body: data
    }
    return response
}