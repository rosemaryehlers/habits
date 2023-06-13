package main

import (
    "encoding/json"
    "io"
    "net/http"

    "gobase"
)

func main() {
    a := gobase.NewApplication()
    defer a.Lifecycle.Begin()

    r := a.WithHttpServer()
    db := gobase.NewRepository(a.Logger)

    a.Config.AddConfigFunc(db.Reload)

    r.HandleFunc("POST", "/view/create", CreateView(db, a.Logger))
    r.HandleFunc("GET", "/view/all", GetAllViews(db, a.Logger))
}

func CreateView(db *gobase.Repository, l gobase.Logger) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req gobase.View
		_ = json.NewDecoder(r.Body).Decode(&req)
		if len(req.Name) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		view, err := db.CreateView(req.Name)
		switch {
		case err == gobase.DatabaseConnectionError:
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		case err == gobase.DuplicateKeyError:
			w.WriteHeader(http.StatusConflict)
			return
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			io.WriteString(w, err.Error())
			return
		default:
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(view)
    }
}

func GetAllViews(db *gobase.Repository, l gobase.Logger) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        views, err := db.GetAllViews()
		switch {
		case err == gobase.DatabaseConnectionError:
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			io.WriteString(w, err.Error())
			return
		default:
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(views)
    }
}