package tests

import (
    //"encoding/json"
    //"io"
    //"net/http"
	//"fmt"
	//"database/sql"
	"testing"
)

type View struct {
	id int64
	name string
}

func TestGetAllViews(t *testing.T){
	RunScript("views_setup.sql", t)

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