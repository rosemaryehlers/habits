package tests

import (
    //"encoding/json"
    //"io"
    //"net/http"
	//"fmt"
	"testing"

	//"github.com/go-sql-driver/mysql"
)

type View struct {
	id int64
	name string
}

func TestGetAllViews(t *testing.T){
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
	HttpTest("Get All Views", req, expects)
}