package gobase

import (
	"database/sql"
	"errors"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
	"github.com/spf13/viper"
)

type Repository struct {
	l  Logger
	DB *sql.DB
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
	fmt.Println("DB config", hostname, username, password, database)

	if len(hostname) == 0 || len(username) == 0 || len(password) == 0 || len(database) == 0 {
		r.l.Error(DatabaseConfigError.Error())
	}

	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/%s", username, password, hostname, database))
	if err != nil {
		fmt.Println(err)
		r.l.Error(DatabaseConfigError.Error())
	}

	r.DB = db
}