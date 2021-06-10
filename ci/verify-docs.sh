#!/usr/bin/env bash

checkReadmeFile() {
    NPM_SCRIPT_SUFFIX=$1
    README_DIRECTORY=$2
    DOCS_CONFIG_FILE=$3

    git diff --exit-code "./${README_DIRECTORY}/README.md"
    EXIT_CODE=$?

    if [ "$EXIT_CODE" != "0" ]; then
        echo "ERROR: JS ${NPM_SCRIPT_SUFFIX} API documentation not up-to-date with the source code. Follow these steps:"
        echo " - verify if '${DOCS_CONFIG_FILE}' configuration file is up-to-date with '${README_DIRECTORY}' folder content,"
        echo " - run 'npm run docs:${NPM_SCRIPT_SUFFIX}',"
        echo " - check and commit updated README.md file."
    fi

    return $EXIT_CODE
}

checkReadmeFile "frontend" "src" "documentation.yml"; FRONTEND_CHECK_EXIT_CODE=$?
checkReadmeFile "backend" "backend" "backend/documentation.yml"; BACKEND_CHECK_EXIT_CODE=$?

! (( $FRONTEND_CHECK_EXIT_CODE || $BACKEND_CHECK_EXIT_CODE ))
