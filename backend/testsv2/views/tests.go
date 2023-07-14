package views

import (
    //"encoding/json"
    //"io"
    //"net/http"
	//"fmt"

	//"github.com/go-sql-driver/mysql"
	tr "testrunner"
)

var tests []func(*tr.TestEnvvars)

type View struct {
	id int64
	name string
}

func GetAllViews(env *tr.TestEnvvars){
	req := tr.RequestInputs{
		Method: tr.GET,
		Path: "/v1/view/all",
	}
	expectedBody := []View{
		View{ id: 1, name: "delete me" },
		View{ id: 2, name: "one" },
		View{ id: 3, name: "two" },
	}
	expects := tr.Expects{
		Status: 200,
		Body: expectedBody,
	}
	env.HttpTest("Get All Views", req, expects)
}
func Tests() []func(*tr.TestEnvvars) {
	tests = append(tests, GetAllViews)
	return tests
}