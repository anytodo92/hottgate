#!/bin/bash

ROOT="/data1/home/srt/src/metagate"
TARGET="deployment"

echo "Metagate web deploy to 0N3"
echo

cd "$ROOT" || exit 1

# cleanup

echo -n "cleanup:"
ssh nasih-dev "rm -rf landing app res" || exit 1
ssh nasih-dev "mkdir app landing res" || exit 1
echo " done"

# landing page
echo -n "landing page: build"
cd landing
hugo --quiet || exit 1
cd "$ROOT"
echo -n " upload"
rsync -a -e ssh landing/public/ nasih-dev:landing || exit 1
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
rsync -a -e ssh frontend/build/ nasih-dev:app || exit 1
echo " done"

# resources

echo -n "resources: upload"
rsync -a -e ssh resources/ nasih-dev:res || exit 1
echo " done"

echo "all done"
