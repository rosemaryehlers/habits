package tests

import (
    //"encoding/json"
    //"io"
    //"net/http"
	//"fmt"
	//"database/sql"
	"os"
	"testing"
)

type View struct {
	id int64
	name string
}

func setupSql(t *testing.T) {
	filename := "views_setup.sql"
	data, err := os.ReadFile(filename)
	if err != nil {
		t.Logf("Error reading sql setup file %v, could not run tests. %v", filename, err)
		t.FailNow() // don't run tests if setup fails
	}

	repo := GetDB()
	if repo == nil {
		t.Logf("Database connection not set up for executing %v", filename)
		t.FailNow()
	}

	query := string(data[:])
	_, err = repo.DB.Exec(query)
	if err != nil {
		t.Logf("Sql setup file %v failed to execute: %v", filename, err)
		t.FailNow()
	}
}

func TestGetAllViews(t *testing.T){
	//setupSql(t)

	req := RequestInputs{
		Method: GET,
		Path: "/v1/view/all",
	}
	expectedBody := []View{
		View{ id: 1, name: "delete me" },
		View{ id: 2, name: "one" },
		View{ id: 3, name: "two" },
	}
	expects := Expects{
		Status: 200,
		Body: expectedBody,
	}
	HttpTest(t, "Get All Views", req, expects)
}