#!/bin/sh

SESSION_NAME="tea"

byobu kill-session -t "$SESSION_NAME" 2> /dev/null

echoRunnerCommand() {
  COMMAND=$1
  echo "bash --rcfile <(echo '. ~/.bashrc; history -s $COMMAND; $COMMAND')"
}
byobu new-session -d -s "$SESSION_NAME" -n "Price Fetcher" "cd priceFetcher && $(echoRunnerCommand 'python3 fetcher.py')"
byobu new-window -t "$SESSION_NAME" -n "SQL Server" "cd priceFetcher && $(echoRunnerCommand 'python3 sqlite_server.py')"
byobu new-window -t "$SESSION_NAME" -n "Tea Dispenser" "$(echoRunnerCommand 'yarn start')"

byobu
