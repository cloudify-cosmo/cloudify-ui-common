#!/usr/bin/env bash
set -euo pipefail

#===================================================================================
# Usage:
#   get-ts-migration-progress [list of directories to check]
#
# Description:
#   Prints the summary of the migration to TypeScript.
#
# Arguments:
#   $1 (directories to check) - by default check is executed in the current directory
#
#===================================================================================

DIRECTORIES_TO_CHECK=${1:-.}
echo "Inspecting files in directories: $DIRECTORIES_TO_CHECK"

JS_FILES_COUNT=`find $DIRECTORIES_TO_CHECK -type f \( -name '*.js' -o -name '*.jsx' \) ! -path '*node_modules*' ! \
-name '*.config.js' ! -path '*/.*' | wc -l`
echo "Found $JS_FILES_COUNT JS/JSX files"

TS_FILES=`find $DIRECTORIES_TO_CHECK -type f \( -name '*.ts' -o -name '*.tsx' \) ! -path '*node_modules*'`
TS_FILES_COUNT=`echo "$TS_FILES" | sed -r '/^\s*$/d' | wc -l`
echo "Found $TS_FILES_COUNT TS/TSX files"
if test $TS_FILES_COUNT -gt 0; then
    TS_NOCHECK_COUNT=`grep '@ts-nocheck' $TS_FILES | wc -l || true`
    echo "$TS_NOCHECK_COUNT out of these TS/TSX files have a '@ts-nocheck' header"
else
    TS_NOCHECK_COUNT=0
fi

TOTAL_FILES_COUNT=$(($JS_FILES_COUNT+$TS_FILES_COUNT))

function print_summary {
    local name=$1
    local files_count=$2
    echo "$name: $files_count / $TOTAL_FILES_COUNT (`bc <<< "scale=2; $files_count * 100 / $TOTAL_FILES_COUNT"`%)"
}

TS_FULLY_MIGRATED_COUNT=$(($TS_FILES_COUNT - $TS_NOCHECK_COUNT))
printf "\nSummary:\n"
print_summary "JS/JSX" $JS_FILES_COUNT
print_summary "TS/TSX" $TS_FILES_COUNT
print_summary "Fully migrated TS/TSX" $TS_FULLY_MIGRATED_COUNT
