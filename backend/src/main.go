package habits

import (
    "gobase"
)

func main() {
    l := gobase.NewLogger()
    r := gobase.NewRouter(l)
    s := gobase.NewHttpServer(l, r)
    defer s.Start()

    //r.HandleFunc("GET", "/ping", Pong())
}