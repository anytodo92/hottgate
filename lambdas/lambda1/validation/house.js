const yup = require('yup')

let hasLog = false

exports.setDetailedLogs = (bl) => {
    hasLog = bl
}

exports.houseValidationSchema = yup.object({
    name: yup
        .string('Enter the house name that everyone will see')
        .min(5, 'Please enter a house name between 5-32 characters')
        .max(32, 'Please enter a house name between 5-32 characters')
        .matches(/[\u202E\u202D\p{Letter}\p{Number} \-_]+/, 'Names must consist of letters spaces, dashes (-) and underscores (_)')
        .required("Please add a name for the house"),
    // nftAddress: yup
    //     .string()
    //     .matches(/0x[0-9a-fA-F]{40}/, 'Invalid address')
    //     .required("Please enter the address of the NFT"),
});
