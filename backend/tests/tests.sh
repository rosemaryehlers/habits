if [ -f setup.sql ]; then
	#Setup database
	mysql --defaults-extra-file=<(echo $'[client]\npassword='"$MYSQL_PASSWORD") -u$MYSQL_USERNAME -h$MYSQL_HOSTNAME habits < setup.sql
	if [ $? -ne 0 ]; then
		echoerr "Setup failed, aborting"
		exit 1
	fi
fi

# things inside " get automatically escaped, things inside ' do not
simple_http_test "Get all views" GET 'v1/view/all' "" 200 "View_All_Response.json"