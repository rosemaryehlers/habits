package main

import (
    "gobase"
    "endpoints"
)

func main() {
    a := gobase.NewApplication()
    defer a.Lifecycle.Begin()
    
    db := gobase.NewRepository(a.Logger)
    a.Config.AddConfigFunc(db.Reload)
    
    r := a.WithHttpServer()
    r.HandleFunc("POST", "/view/create", endpoints.CreateView(db, a.Logger))
    r.HandleFunc("GET", "/view/all", endpoints.GetAllViews(db, a.Logger))
}