FROM golang as build
WORKDIR /app

COPY src .
RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build  -a -installsuffix cgo -o main .

FROM alpine
WORKDIR /app/

COPY --from=build /app/main .

EXPOSE 80

CMD ["./main"]