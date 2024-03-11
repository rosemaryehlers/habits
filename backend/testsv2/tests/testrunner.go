package tests

import(
	"bytes"
    "encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"reflect"
	"testing"
	"sync"

	"github.com/spf13/viper"
	"gobase"
)

type Method int
const (
	GET		Method = 1
	POST	Method = 2
)
func (m Method) String() string {
	switch m {
	case GET:
		return "GET"
	case POST:
		return "POST"
	default:
		return "UNKNOWN"
	}
}

type RequestInputs struct {
	Method	Method
	Path	string
	Body	any
}
type Expects[T any] struct {
	Status	int
	Body T
}
type HttpResp struct {
	Status int
	Body []byte
}

var viperOnce sync.Once
func initViper() error {
	var returnErr error
	viperOnce.Do(func(){
		configFile := os.Getenv("CONFIG_FILE")
		viper.SetConfigName(path.Base(configFile))
		viper.SetConfigType(path.Ext(configFile)[1:])
		viper.AddConfigPath(path.Dir(configFile))
		err := viper.ReadInConfig()
		if err != nil {
			fmt.Printf("Fatal error config file: %v, %v \n", configFile, err)
			returnErr = err
		}
	})
	return returnErr
}
func GetDomain() (string, error) {
	err := initViper()
	if err != nil {
		return "", err
	}
	return viper.GetString("Config.Domain"), nil
}

var db *gobase.Repository
var dbOnce sync.Once
func initDB() *gobase.Repository {
	dbOnce.Do(func(){
		err := initViper()
		if err != nil {
			fmt.Println("Could not init configuration for database")
			return
		}
		l := gobase.NewLogger()
		db = gobase.NewRepository(l)
		db.Reload()
	})
	return db
}

func RunScript(filename string, t *testing.T) error {
	initDB()
	data, err := os.ReadFile(filename)
	if err != nil {
		t.Logf("Error reading sql setup file %v, could not run tests. %v", filename, err)
		return err
	}

	if db == nil {
		t.Logf("Database connection not set up for executing %v", filename)
		return err
	}

	query := string(data[:])
	_, err = db.DB.Exec(query)
	if err != nil {
		t.Logf("Sql setup file %v failed to execute: %v", filename, err)
		return err
	}

	return nil
}

func HttpCall(t *testing.T, reqInputs RequestInputs) (*HttpResp) {
	var req *http.Request
	var err error
	/*
	reqJson, err := json.Marshal(reqInputs)
	if err != nil {
		t.Logf("Error marshalling request inputs: %v", err.Error())
		t.FailNow()
	}
	fmt.Println("Building request with inputs: " + string(reqJson))
	*/

	domain, err := GetDomain()
	if err != nil {
		t.Logf("Error fetching domain: %v", err.Error())
		t.FailNow()
	}

	url := "http://" + domain + reqInputs.Path
	if reqInputs.Method == GET {
		req, err = http.NewRequest(GET.String(), url, nil)
	} else if reqInputs.Method == POST {
		jsonStr, err := json.Marshal(reqInputs.Body)
		if err == nil {
			req, err = http.NewRequest(POST.String(), url, bytes.NewBuffer(jsonStr))
		}
	}
	if err != nil {
		t.Logf("Error creating request: %v", err.Error())
		t.FailNow()
	}
	//req.Header.Add("", "")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		t.Logf("Error sending request: %v", err.Error())
		t.FailNow()
	}
	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Logf("Error reading body: %v", err.Error())
		t.FailNow()
	}

	return &HttpResp{
		Status: resp.StatusCode,
		Body: bodyBytes,
	}
}

func ValidateResponse[T any](t *testing.T, expects Expects[T], response *HttpResp) {
	if( response.Status != expects.Status) {
		t.Logf("Expected status code %v. Got status code %v", expects.Status, response.Status)
		t.FailNow()
	}

	var actualBody T
	err := json.Unmarshal(response.Body, &actualBody)
	if( err != nil ){
		t.Logf("Error unmarshaling request body: %v", err)
		t.FailNow()
	}

	if(!reflect.DeepEqual(expects.Body, actualBody)) {
		var expectedStr, err = json.Marshal(expects.Body)
		if( err != nil ) {
			t.Logf("Could not marshal expected body")
		}
		t.Logf("Actual request body did not match expected. Expected: %v | Actual: %v", string(expectedStr[:]), string(response.Body[:]))
		t.FailNow()
	}
}