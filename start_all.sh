readonly SESSION_NAME="tea"

byobu kill-session -t "$SESSION_NAME" 2> /dev/null

byobu new-session -d -s "$SESSION_NAME" -n "Price Fetcher" "cd priceFetcher && python3 fetcher.py"
byobu new-window -t "$SESSION_NAME" -n "SQL Server" "cd priceFetcher && python3 sqlite_server.py"
byobu new-window -t "$SESSION_NAME" -n "Tea Dispenser" "yarn start"

byobu
