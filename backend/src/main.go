package main

import (
    "gobase"
)

func main() {
    a := gobase.NewApplication()
    defer a.Lifecycle.Begin()

    a.WithHttpServer()
}