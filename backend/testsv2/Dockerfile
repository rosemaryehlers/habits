FROM golang:1.20-alpine

WORKDIR /app
COPY . .
RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o tests .

RUN if [ "$(which apk)" ]; then apk --no-cache add ca-certificates; fi

EXPOSE 80

#ENTRYPOINT ["sh", "-c", "/app/tests"]
ENTRYPOINT ["go", "test", "-v", "./..."]