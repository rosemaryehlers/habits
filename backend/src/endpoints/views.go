package endpoints

import (
    "encoding/json"
    "io"
    "net/http"

	"github.com/go-sql-driver/mysql"
	"gobase"
)

type View struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

func FmtError(msg string) any {
	return struct { error string } { error: msg }
}

func CreateView(db *gobase.Repository, l gobase.Logger) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req View
		_ = json.NewDecoder(r.Body).Decode(&req)
		if len(req.Name) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(FmtError("Invalid name."))
			return
		}

		view, err := createView(db, req.Name)
		switch {
		case err == gobase.DatabaseConnectionError:
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		case err == gobase.DuplicateKeyError:
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(FmtError("Name already used."))
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
        views, err := getAllViews(db)
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

func UpdateView(db *gobase.Repository, l gobase.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req View
		_ = json.NewDecoder(r.Body).Decode(&req)
		if len(req.Name) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(FmtError("Invalid name."))
			return
		}
		if req.Id < 1 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(FmtError("View does not exist."))
			return
		}

		err := updateView(db, req)
		switch {
		case err == gobase.DatabaseConnectionError:
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		case err == gobase.DuplicateKeyError:
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(FmtError("Name already used."))
			return
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			io.WriteString(w, err.Error())
			return
		default:
		}

		w.WriteHeader(http.StatusOK)
	}
}

func DeleteView(db *gobase.Repository, l gobase.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req View
		_ = json.NewDecoder(r.Body).Decode(&req)
		if req.Id < 1 {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(FmtError("View does not exist."))
			return
		}

		err := deleteView(db, req.Id)
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
	}
}

// database access methods
func createView(r *gobase.Repository, name string) (*View, error) {
	if r.DB == nil {
		return nil, gobase.DatabaseConnectionError
	}

	res, err := r.DB.Exec("INSERT INTO `views` (`name`) VALUES (?)", name)
	if err != nil {
		sqlErr, ok := err.(*mysql.MySQLError)
		if !ok {
			return nil, err
		}
		if sqlErr.Number == 1062 {
			return nil, gobase.DuplicateKeyError
		}
		return nil, err
	}

	id, err := res.LastInsertId()
	return &View{Id: id, Name: name}, err
}

func getAllViews(r *gobase.Repository) ([]View, error) {
	if r.DB == nil {
		return nil, gobase.DatabaseConnectionError
	}

	rows, err := r.DB.Query("SELECT `id`,`name` FROM `views` ORDER BY `id` ASC")
	defer rows.Close()
	if err != nil {
		return nil, err
	}

	var views []View
	for rows.Next() {
		var view View
		err := rows.Scan(&view.Id, &view.Name)
		if err != nil {
			return nil, err
		}
		views = append(views, view)
	}
	err = rows.Err()
	return views, err
}

func updateView(r *gobase.Repository, view View) error {
	if r.DB == nil {
		return gobase.DatabaseConnectionError
	}

	_, err := r.DB.Exec("UPDATE `views` SET `name` = `?` WHERE id = ?", view.Name, view.Id)
	if err != nil {
		sqlErr, ok := err.(*mysql.MySQLError)
		if !ok {
			return err
		}
		if sqlErr.Number == 1062 {
			return gobase.DuplicateKeyError
		}
		return err
	}

	return err
}

func deleteView(r *gobase.Repository, id int64) error {
	if r.DB == nil {
		return gobase.DatabaseConnectionError
	}

	_, err := r.DB.Exec("DELETE FROM `views` WHERE id = ?", id)
	if err != nil {
		sqlErr, ok := err.(*mysql.MySQLError)
		if !ok {
			return err
		}
		if sqlErr.Number == 1062 {
			return gobase.DuplicateKeyError
		}
		return err
	}

	return err
}