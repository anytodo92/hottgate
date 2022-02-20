const yup = require('yup')

var hasLog = false

exports.setDetailedLogs = (bl) => {
    hasLog = bl
}

function validateURL(url, domain) {
    if (hasLog) {
        console.log(`Assessing, '${url}', against, '${domain}'`)
    }
    
    if (!url || url.length === 0) {
        if (hasLog) {
            console.log("Invalid url.")
        }
        return { ok: true }
    }

    if (url.length > 255) {
        if (hasLog) {
            console.log("The url is longer. Length: ", url.length)
        }

        return { ok: false, error: "The url is longer." }
    }

    try {
        url = new URL(url)
    } 
    catch (err) {
        if (hasLog) {
            console.log("Not a valid url.")
        }
        return { ok: false, error: err.toString() }
    }

    if (domain) {
        if (url.origin !== "https://" + domain) {
            if (hasLog) {
                console.log("Invalid origin : '" + url.origin + "'");
            }
            return { ok: false, error: "Invalid origin, '" + url.origin + "'" }
        }
    } 
    else {
        if (url.protocol != "https:") {
            if (hasLog) {
                console.log("Invalid protocol : ", url.protocol)
            }
            
            return { ok: false, error: "Invalid protocal." }
        }
    }

    if (url.search.length > 0) {
        if (hasLog) {
            console.log("The url has query parameters.")
        }

        return { ok: false, error: "invalid URL" }
    }

    if (hasLog) {
        console.log("validated")
    }
    
    return { ok: true, error: "" }
}

exports.profileValidationSchema = yup.object({
    displayname: yup
        .string('Please enter the name that everyone will see')
        .min(5, 'Please enter a name between 5-32 characters')
        .max(32, 'Please enter a name between 5-32 characters')
        .matches(/[\p{Letter}\p{Number}\-_]+/, 'Names must consist of letters spaces, dashes (-) and underscores (_)'),
    oncyber: yup
        .string('https://oncyber.io/yourpageid')
        .test('oncyber', 'Invalid oncyber URL', (value) => {
            const res = validateURL(value, 'oncyber.io')
            return res.ok
        }),
    opensea: yup
        .string('https://opensea.io/collections/yourcollection')
        .test('oncyber', 'Invalid oncyber URL', (value) => {
            const res = validateURL(value, 'opensea.io')
            return res.ok
        }),
    metamask: yup
        .string()
        .matches(/0x[0-9a-fA-F]{40}/, 'Invalid address')
});
