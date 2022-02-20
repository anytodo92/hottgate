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

source "$ROOT/$1.env"
cp "$ROOT/$1.env" frontend/.env
cp "$ROOT/$1.env" frontend/.env.production
echo "PUBLIC_URL=/app" >> frontend/.env.production

cd "$ROOT" || exit 1

# cleanup

echo -n "cleanup:"
ssh $SSH_HOST "rm -rf landing app res" || exit 1
ssh $SSH_HOST "mkdir app landing res" || exit 1
echo " done"

# landing page
echo -n "landing page: build"
cd landing
hugo --quiet || exit 1
cd "$ROOT"
echo -n " upload"
rsync -a -e ssh landing/public/ $SSH_HOST:landing || exit 1
echo " done"

# active page
echo -n "active page: build"
cd frontend || exit 1
npx browserslist@latest --update-db >build.log 2>&1 && \
yarn run build >>build.log 2>&1 || {
    cat build.log
    exit 1
}
cd "$ROOT"

echo -n " upload"
rsync -a -e ssh frontend/build/ $SSH_HOST:app || exit 1
echo " done"

# resources

echo -n "resources: upload"
rsync -a -e ssh resources/ $SSH_HOST:res || exit 1
echo " done"

echo "all done"
