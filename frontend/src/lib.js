
exports.fetchAssets = (wallet, callback) => {
    console.log("fetching assets from opensea...");
    fetch('https://api.opensea.io/api/v1/assets?order_direction=asc&offset=0&limit=20&owner=' + wallet)
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                console.log("jwtFetch Error:", response.status, response.statusText);
                return null;
            }
        })
        .then((res) => {
            console.log(res);
            callback(res);
        })
        .catch((err) => console.log("opensea error", err))
}