if [ -f setup.sql ]; then
	#Setup database
	mysql --defaults-extra-file=<(echo $'[client]\npassword='"$MYSQL_PASSWORD") -u$MYSQL_USERNAME -h$MYSQL_HOSTNAME habits < setup.sql
	if [ $? -ne 0 ]; then
		echoerr "Setup failed, aborting"
		exit 1
	fi
fi
