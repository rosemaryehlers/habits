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
    r.HandleFunc("POST", "/v1/view/create", endpoints.CreateView(db, a.Logger))
    r.HandleFunc("GET", "/v1/view/all", endpoints.GetAllViews(db, a.Logger))
    r.HandleFunc("POST", "/v1/view/update", endpoints.UpdateView(db, a.Logger))
    r.HandleFunc("POST", "/v1/view/delete", endpoints.DeleteView(db, a.Logger))

    r.HandleFunc("POST", "/v1/task/create", endpoints.CreateTask(db, a.Logger))
    r.HandleFunc("GET", "/v1/task/all", endpoints.GetAllTasks(db, a.Logger))
}