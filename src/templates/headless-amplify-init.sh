#!/bin/bash
set -e
IFS='|'

AMPLIFY="{\
\"envName\":\"<?amplifyEnv?>\"\
}"

amplify init \
--amplify $AMPLIFY \
--yes
