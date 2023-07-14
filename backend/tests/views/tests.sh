if [ -f setup.sql ]; then
	#Setup database
	mysql --defaults-extra-file=<(echo $'[client]\npassword='"$MYSQL_PASSWORD") -u$MYSQL_USERNAME -h$MYSQL_HOSTNAME habits < setup.sql
	if [ $? -ne 0 ]; then
		echoerr "Setup failed, aborting"
		exit 1
	fi
fi

# things inside " get automatically escaped, things inside ' do not

# views
simple_http_test "Get all views" GET 'v1/view/all' "" 200 "View_All_Response.json"
simple_http_test "Create view" POST 'v1/view/create' "View_Create_Request.json" 200 "View_Create_Response.json"
simple_http_test "Create view error: no name" POST 'v1/view/create' "View_Create_NoName_Request.json" 400 ""
simple_http_test "Create view error: duplicate" POST 'v1/view/create' "View_Create_Request.json" 409 ""
simple_http_test "Update view" POST 'v1/view/update' "View_Update_Request.json" 200 ""
simple_http_test "Update view error: no name" POST 'v1/view/update' "View_Update_Request_NoName.json" 400 ""
simple_http_test "Update view error: duplicate" POST 'v1/view/update' "View_Update_Request.json" 409 ""