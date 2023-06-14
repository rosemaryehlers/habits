#Wait for service ready
timer=0
while [ "$(curl -s -o /dev/null -w '%{http_code}' "$SERVICE_URL/health")" -ne "200" ]; do
	sleep 1
	((timer++))
	if [ $(expr $timer % 10) -eq 0 ]; then
		echo "Waited $timer seconds for Service, will wait maximum $READY_TIMEOUT seconds"
	fi
	if [ $timer -gt $READY_TIMEOUT ]; then
		echoerr "Waited too long for Service to be ready, aborting"
		exit 1
	fi
done
echo "Service ready"

#Wait for database ready
timer=0
until mysql --defaults-extra-file=<(echo $'[client]\npassword='"$MYSQL_PASSWORD") -u$MYSQL_USERNAME -h$MYSQL_HOSTNAME -sN -e "SELECT 'Database ready'" 2>/dev/null; do
	sleep 1
	((timer++))
	if [ $(expr $timer % 10) -eq 0 ]; then
		echo "Waited $timer seconds for Database, will wait maximum $READY_TIMEOUT seconds"
	fi
	if [ $timer -gt $READY_TIMEOUT ]; then
		echoerr "Waited too long for Database to be ready, aborting"
		exit 1
	fi
done
