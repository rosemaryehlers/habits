FROM golang:1.20-alpine

WORKDIR /app
COPY src/go.mod .
RUN go mod download

COPY src .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o habits .

RUN if [ "$(which apk)" ]; then apk --no-cache add ca-certificates; fi

EXPOSE 80

ENTRYPOINT ["sh", "-c", "/app"]
