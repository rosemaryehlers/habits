#!/bin/bash
passed=0;
failures=0;

echoerr() { printf "%s\n" "$*" >&2; }

failure(){
	statusCode=$1;shift
	expectedStatusCode=$1;shift
	failureMessage=$1;shift
	context=$1;shift

	echo "$failureMessage"
	echo "StatusCode: $statusCode, expected: $expectedStatusCode"
	echo -e "$context"
	((failures++))
}

httpWithHeaders(){
	method=$1;shift
	endpoint=$1;shift
	request=$1;shift
	response=$1;shift
	extraCurlOpts=$1;shift

	if [[ "$CURL_VERBOSE" =~ ^(((T|t)rue)|1)$ ]]; then
		verbose="-v"
	else
		verbose="-s"
	fi

	data=''
	if [ ! "$method" == "GET" ]; then
		if [ -f "$request" ]; then
			data="--data @$request"
		elif [ -n "$request" ]; then
			echoerr "Unable to open file: $request"
		fi
	fi

	if [ -n "$extraCurlOpts" ]; then
		opts="$extraCurlOpts"
	else
		opts="-buseless=cookie"
	fi

	curl $opts $verbose -o "$response" -i -X "$method" -H 'Content-Type: application/json' "$SERVICE_URL/$endpoint" $data
}

sql(){
	query="$1";shift
	echo $(echo "$query" | mysql --defaults-extra-file=<(echo $'[client]\npassword='"$MYSQL_PASSWORD") -u$MYSQL_USERNAME -h$MYSQL_HOSTNAME -N media)
}

rowCount(){
	echo $(sql "$1")
}

diff_response(){
	expectedResponse=$1;shift
	actualResponse=$1;shift

	diff=''

	echo "$actualResponse" | jq -S .  > /dev/null 2>&1
	if [ $? -ne 0 ]; then
		diff="\nParse error in actual response:\n$(echo "$actualResponse")\n"
	fi
	if [ -f "$expectedResponse" ]; then
		jq -S . "$expectedResponse" > /dev/null 2>&1
		if [ $? -ne 0 ]; then
			diff="${diff}Parse error in expected response:\n$(cat "$expectedResponse")\n"
		fi
	fi

	if [ -z "$diff" ]; then
		if [ -f "$expectedResponse" ]; then
			diff=$(diff -U 5 --color=always <(echo "$actualResponse" | jq -S .) <(jq -S . "$expectedResponse"))
		else
			if [[ "$expectedResponse" =~ .json$ ]]; then
				echoerr "$expectedResponse looks like a file, but none found!"
			fi
			diff=$(diff -U 5 --color=always <(echo "$actualResponse" | jq -S .) <(echo "$expectedResponse" | jq -S .))
		fi
	fi

	echo "$diff"
}

simple_http_test(){
	testName=$1;shift
	method=$1;shift
	endpoint=$1;shift
	request=$1;shift
	expectedStatusCode=$1;shift
	expectedResponse=$1;shift
	extraCurlOpts=$1;shift

	httpWithHeaders "$method" "$endpoint" "$request" 'response' "$extraCurlOpts"
	statusCode=$(head -n1 response | sed -E 's/^HTTP.*? ([0-9]+).*$/\1/')
	body=$(cat response | tr '\n' '\r' | sed -E 's/^.*?\r\r\r\r(.*)$/\1/' | tr '\r' '\n')
	diff=$(diff_response "$expectedResponse" "$body")

	if [ "$statusCode" -ne "$expectedStatusCode" ] || [ ! -z "$diff" ]; then
		failure "$statusCode" "$expectedStatusCode" "$testName: $method $endpoint" "$diff"
	else
		((passed++))
	fi

	if [ -f 'response' ]; then
		rm 'response'
	fi
}

simple_sql_test(){
	testName=$1;shift
	method=$1;shift
	endpoint=$1;shift
	request=$1;shift
	expectedStatusCode=$1;shift
	expectedResponse=$1;shift
	query=$1;shift
	expectedRowCount=$1;shift

	initialRowCount=$(rowCount "$query")
	httpWithHeaders "$method" "$endpoint" "$request" 'response' "$extraCurlOpts"
	statusCode=$(head -n1 response | sed -E 's/^HTTP.*? ([0-9]+).*$/\1/')
	body=$(cat response | tr '\n' '\r' | sed -E 's/^.*?\r\r\r\r(.*)$/\1/' | tr '\r' '\n')

	rowCount=$(rowCount "$query")
	diff=$(diff_response "$expectedResponse" "$body")

	if [ $statusCode -ne $expectedStatusCode ] \
		|| [ ! -z "$diff" ] \
		|| [ $rowCount -ne $expectedRowCount ] \
		|| [ $initialRowCount -eq $rowCount ]
		then
			failure "$statusCode" "$expectedStatusCode" "$testName: $method $endpoint" "Response diff: $diff\nInitial/Final rows: $initialRowCount/$rowCount"
	else
		((passed++))
	fi

	if [ -f 'response' ]; then
		rm 'response'
	fi
}

if [ -f waits.sh ]; then
	. waits.sh
fi

if [ -f setup.sh ]; then
	. setup.sh
fi

. tests.sh

echo "Tests Passed: $passed"
if [ $failures -gt 0 ]; then
	echoerr "Test Failures: $failures"
	exit 1;
fi