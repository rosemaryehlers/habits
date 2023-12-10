package tests

import (
	"testing"
)

type View struct {
	Id int64 `json:id`
	Name string `json:name`
}

func TestGetAllViews(t *testing.T){
	RunScript("views_setup.sql", t)

	req := RequestInputs{
		Method: GET,
		Path: "/v1/view/all",
	}
	expectedBody := `[{"id":1,"name":"delete me"},{"id":2,"name":"one"},{"id":3,"name":"two"}]`
	expects := Expects{
		Status: 200,
		Body: expectedBody,
	}
	HttpTest(t, "Get All Views", req, expects)
}