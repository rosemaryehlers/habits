FROM mariadb:10.7.7-focal
WORKDIR /tests

RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends curl jq && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY entrypoint.sh /

ENTRYPOINT ["/entrypoint.sh"]