#!/bin/bash
ROOT=`dirname $0`
ROOT=`realpath $ROOT` || exit 1

echo "Metagate web deploy from $ROOT"
echo

[[ -z $1 ]] && {
    echo "Usage: `basename $0` <config>"
    echo "where <config> is a file called <config>.env with the details"
    echo
    exit 1
}

source "$ROOT/../../$1.env"

[[ ! -d node_modules ]] && {
    echo "Please run npm install"
    exit 1
}

[[ -e custom-authorizer.zip ]] && {
    rm -f custom-authorizer.zip || exit 1
}
zip -qr custom-authorizer.zip index.js lib.js node_modules || exit 1

aws lambda update-function-code \
    --function-name $AUTHORISER_LAMBDA \
    --region $REGION \
    --profile $PROFILE \
    --zip-file fileb://custom-authorizer.zip
