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

yarn run bundle || exit 1
aws lambda update-function-code \
    --function-name $LAMBDA \
    --region $REGION \
    --profile $PROFILE \
    --zip-file fileb://lambda.zip
