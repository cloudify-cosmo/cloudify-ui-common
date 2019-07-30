#!/usr/bin/env bash

git diff --exit-code --compact-summary ./src/README.md
EXIT_CODE=$?

if [ "$EXIT_CODE" != "0" ]; then
  echo "ERROR: JS API documentation not up-to-date with the source code. Follow these steps:"
  echo " - verify if 'documentation.yml' configuration is up-to-date with the 'src' folder content,"
  echo " - run 'npm run docs',"
  echo " - check output 'src/README.md' file,"
  echo " - commit updated 'src/README.md' file."
  exit 1
fi;
