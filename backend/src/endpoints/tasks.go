package endpoints

import (
	//"database/sql"
    "encoding/json"
    "io"
    "net/http"

	"github.com/go-sql-driver/mysql"
	"gobase"
)

type TaskType int64
const(
	Unknown TaskType = iota
	Finite
	Infinite
)
func (t TaskType) String() string {
	switch(t) {
	case Finite:
		return "finite"
	case Infinite:
		return "infinite"
	default:
		return "unknown"
	}
}

type Task struct {
	Id		int64		`json:"id"`
	Name	string		`json:"name"`
	Type	TaskType	`json:"type"`
	Goal	*int64		`json:"goal"`
}

func GetAllTasks(db *gobase.Repository, l gobase.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		tasks, err := getAllTasks(db)
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
		json.NewEncoder(w).Encode(tasks)
	}
}
func CreateTask(db *gobase.Repository, l gobase.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req Task
		_ = json.NewDecoder(r.Body).Decode(&req)
		if len(req.Name) == 0 {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		task, err := createTask(db, req.Name, req.Type, req.Goal)
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
		json.NewEncoder(w).Encode(task)
	}
}

// database access methods
func createTask(r *gobase.Repository, name string, taskType TaskType, goal *int64) (*Task, error) {
	if r.DB == nil {
		return nil, gobase.DatabaseConnectionError
	}

	res, err := r.DB.Exec("INSERT INTO `tasks` (`name`,`type`,`goal`) VALUES (?)", name, taskType.String(), goal)
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
	return &Task{Id: id}, err
}
func getAllTasks(r *gobase.Repository) ([]Task, error) {
	if r.DB == nil {
		return nil, gobase.DatabaseConnectionError
	}

	rows, err := r.DB.Query("SELECT `id`,`name`,`type`,`goal` FROM `tasks` ORDER BY `id` ASC")
	defer rows.Close()
	if err != nil {
		return nil, err
	}

	var tasks []Task
	for rows.Next() {
		var task Task
		err := rows.Scan(&task.Id, &task.Name, &task.Type, &task.Goal)
		if err != nil {
			return nil, err
		}
		tasks = append(tasks, task)
	}
	err = rows.Err()
	return tasks, err
}