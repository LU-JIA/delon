#!/usr/bin/env bash

set -u -e -o pipefail

readonly currentDir=$(cd $(dirname $0); pwd)
cd ${currentDir}

BUILD=false
TEST=false
DEBUG=false
for ARG in "$@"; do
  case "$ARG" in
    -t)
      TEST=true
      ;;
    -b)
      BUILD=true
      ;;
    -debug)
      DEBUG=true
      ;;
  esac
done

VERSION=$(node -p "require('./package.json').version")
ZORROVERSION=$(node -p "require('./package.json').dependencies['ng-zorro-antd']")
echo "=====BUILDING: Version ${VERSION}, Zorro Version ${ZORROVERSION}"

N="
"
PWD=`pwd`
TSC=${PWD}/node_modules/.bin/tsc
JASMINE=${PWD}/node_modules/.bin/jasmine

SOURCE=${PWD}/packages/schematics/
DIST=${PWD}/publish/schematics/

updateVersionReferences() {
  NPM_DIR="$1"
  (
    echo "======    VERSION: Updating version references in ${NPM_DIR}"
    cd ${NPM_DIR}
    perl -p -i -e "s/ZORRO\-0\.0\.0\-PLACEHOLDER/${ZORROVERSION}/g" $(grep -ril ZORRO\-0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
    perl -p -i -e "s/PEER\-0\.0\.0\-PLACEHOLDER/^${VERSION}/g" $(grep -ril PEER\-0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
    perl -p -i -e "s/0\.0\.0\-PLACEHOLDER/${VERSION}/g" $(grep -ril 0\.0\.0\-PLACEHOLDER .) < /dev/null 2> /dev/null
  )
}

copyFiles() {
  mkdir -p ${2}
  readonly paths=(
    # 确保路径有效性
    "|${2}application/files/"
    "|${2}application/files/src"
    "|${2}application/files/src/assets"
    "|${2}application/files/src/assets/_"
    "|${2}application/_files/"
    "|${2}application/_files/src/"
    # code styles
    "${1}.prettierignore|${2}application/files/__dot__prettierignore"
    "${1}.prettierrc|${2}application/files/__dot__prettierrc"
    "${1}.stylelintrc|${2}application/files/__dot__stylelintrc"
    # ci
    "${1}.vscode|${2}application/files/__dot__vscode"
    "${1}_nginx|${2}application/files/_nginx"
    "${1}.dockerignore|${2}application/files/__dot__dockerignore"
    "${1}docker-compose.debug.yml|${2}application/files"
    "${1}docker-compose.yml|${2}application/files"
    "${1}Dockerfile|${2}application/files"
    # ci: fix-v6
    "${1}fix-v6.js|${2}application/files"
    # LICENSE
    "${1}LICENSE|${2}application/files"
    "${1}README.md|${2}application/_files"
    "${1}README-zh_CN.md|${2}application/files"
    # src
    "${1}src/environments|${2}application/_files/src/"
    "${1}src/styles|${2}application/_files/src/"
    "${1}src/main.ts|${2}application/_files/src/"
    "${1}src/styles.less|${2}application/_files/src/"
    "${1}src/typings.d.ts|${2}application/files/src/"
    # assets
    "${1}src/assets/_/img/*|${2}application/files/src/assets/_/img/"
  )
  local from to
  for fields in ${paths[@]}
  do
    IFS=$'|' read -r from to <<< "$fields"
    if [[ ${to:(-1):1} == '/' ]]; then
      mkdir -p $to
    fi
    if [[ ${from} != '' ]]; then
      cp -fr $from $to
    fi
  done
}

tsconfigFile=${SOURCE}/tsconfig.json
if [[ ${TEST} == true ]]; then
  tsconfigFile=${SOURCE}/tsconfig.spec.json
  DIST=${PWD}/dist/schematics-test/
fi

if [[ ${BUILD} == true ]]; then
  rm -rf ${DIST}

  echo "Building...${tsconfigFile}"
  $TSC -p ${tsconfigFile}
  rsync -am --include="*.json" --include="*/" --exclude=* ${SOURCE}/ ${DIST}/
  rsync -am --include="*.d.ts" --include="*/" --exclude=* ${SOURCE}/ ${DIST}/
  rsync -am --include="/files" ${SOURCE}/ ${DIST}/
  rm ${DIST}/tsconfig.json ${DIST}/tsconfig.spec.json
  copyFiles 'scaffold/' ${DIST}/

  cp ${SOURCE}/README.md ${DIST}/README.md
  cp ./LICENSE ${DIST}/LICENSE

  updateVersionReferences ${DIST}
fi

if [[ ${TEST} == true ]]; then
  echo "jasmine"
  $JASMINE ${DIST}/**/*_spec.js
fi

echo "Finished test-schematics"

# TODO: just only cipchk
# clear | npm run test:schematics
# clear | bash build-schematics.sh -b -debug
if [[ ${DEBUG} == true ]]; then
  cd ../../
  DEBUG_FROM=${PWD}/work/delon/publish/schematics/*
  DEBUG_TO=${PWD}/test-projects/demo/node_modules/ng-alain/
  echo "DEBUG_FROM:${DEBUG_FROM}"
  echo "DEBUG_TO:${DEBUG_TO}"
  rm -rf ${DEBUG_TO}/application
  rsync -a ${DEBUG_FROM} ${DEBUG_TO}
  echo "DEBUG FINISHED~!"
fi
