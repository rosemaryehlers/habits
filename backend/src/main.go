package habits

import (
    gobase
)

func main() {
    l := NewLogger()
    r := NewRouter(l)
    s := &HttpServer{log: l, router: r}
    defer s.Start()

    //r.HandleFunc("GET", "/ping", Pong())
}