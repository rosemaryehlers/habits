package gobase

import (
	"database/sql"
	"errors"
	"fmt"

	"github.com/go-sql-driver/mysql"
	"github.com/spf13/viper"
)

type Repository struct {
	l  Logger
	db *sql.DB
}

type View struct {
	Id   int64  `json:"id"`
	Name string `json:"name"`
}

var DatabaseConfigError = errors.New("Repository: Error in database configuration")
var DatabaseConnectionError = errors.New("Repository: Database connection error")
var DuplicateKeyError = errors.New("sql: Duplicate Key")

func NewRepository(l Logger) *Repository {
	r := new(Repository)
	r.l = l
	return r
}

func (r *Repository) Reload() {
	hostname := viper.GetString("Sql.Hostname")
	username := viper.GetString("Sql.Username")
	password := viper.GetString("Sql.Password")
	database := viper.GetString("Sql.Database")

	if len(hostname) == 0 || len(username) == 0 || len(password) == 0 || len(database) == 0 {
		r.l.Error(DatabaseConfigError.Error())
	}

	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/%s", username, password, hostname, database))
	if err != nil {
		r.l.Error(DatabaseConfigError.Error())
	}

	r.db = db
}

func (r *Repository) CreateView(name string) (*View, error) {
	if r.db == nil {
		return nil, DatabaseConnectionError
	}

	res, err := r.db.Exec("INSERT INTO `views` (`name`) VALUES (?)", name)
	if err != nil {
		sqlErr, ok := err.(*mysql.MySQLError)
		if !ok {
			return nil, err
		}
		if sqlErr.Number == 1062 {
			return nil, DuplicateKeyError
		}
		return nil, err
	}

	id, err := res.LastInsertId()
	return &View{Id: id, Name: name}, err
}

func (r *Repository) GetViewByName(username string) (*View, error) {
	if r.db == nil {
		return nil, DatabaseConnectionError
	}

	var view View
	err := r.db.QueryRow("SELECT `id`,`name` FROM `views` WHERE `name`=?", username).Scan(&view.Id, &view.Name)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &view, err
}

func (r *Repository) GetAllViews() ([]View, error) {
	if r.db == nil {
		return nil, DatabaseConnectionError
	}

	rows, err := r.db.Query("SELECT `id`,`name` FROM `views` ORDER BY `id` ASC")
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