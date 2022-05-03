# habits

Run wiremock: docker run -it -d -p 8080:8080 --name wiremock -v ~/git/habits/src/tests/wiremock/:/home/wiremock wiremock/wiremock:2.32.0

# Dev process
- run docker-compose run dev to spin up and enter golang container for running actual go commands
- make changes, run go build main.go in container