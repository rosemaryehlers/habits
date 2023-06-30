.PHONY: build, test

build:
	docker build -t habits:latest .

test:
	docker-compose down -v sql-test
	docker-compose up -d sql-test
	docker-compose run tests