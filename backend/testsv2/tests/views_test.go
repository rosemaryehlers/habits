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
	expectedBody := []View{
		View{ Id: 1, Name: "delete me" },
		View{ Id: 2, Name: "one" },
		View{ Id: 3, Name: "two" },
	}
	expects := Expects[[]View]{
		Status: 200,
		Body: expectedBody,
	}
	result := HttpCall(t, req)
	ValidateResponse[[]View](t, expects, result)
}