package tests

import(
	"bytes"
    "encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
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
type Expects struct {
	Status	int
	Body any
}
type TestResults struct {
	Success bool
	Diff []string
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
	fmt.Println(query)
	_, err = db.DB.Exec(query)
	if err != nil {
		t.Logf("Sql setup file %v failed to execute: %v", filename, err)
		return err
	}

	return nil
}

// this is super sus
func compareJson(expects any, actual string) (bool, error) {
	jsonStr, err := json.Marshal(expects)
	if err != nil {
		return false, err
	}
	return string(jsonStr) == actual, nil
}

func HttpTest(t *testing.T, name string, reqInputs RequestInputs, expects Expects) {
	results, err := doHttpTest(reqInputs, expects)
	if err != nil {
		t.Errorf("%v: Error, could not complete. %v \n", name, err)
		return
	}
	if results.Success {
		fmt.Printf("%v: Success \n", name)
	} else {
		fmt.Printf("%v: Failed \n", name)
		t.Fail()
		for i := 0; i < len(results.Diff); i++ {
			fmt.Println(results.Diff[i])
		}
	}
}
func doHttpTest(reqInputs RequestInputs, expects Expects) (TestResults, error) {
	var req *http.Request
	var err error
	var log []string
	reqJson, err := json.Marshal(reqInputs)
	if err != nil {
		log = append(log, "Error marshalling request inputs: " + err.Error())
		return TestResults{
			Success: false,
			Diff: log,
		}, err
	}
	log = append(log, "Building request with inputs: " + string(reqJson))

	domain, err := GetDomain()
	if err != nil {
		log = append(log, "Error fetching domain: " + err.Error())
		return TestResults{
			Success: false,
			Diff: log,
		}, err
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
		log = append(log, "Error creating request: " + err.Error())
		return TestResults{
			Success: false,
			Diff: log,
		}, err
	}
	//req.Header.Add("", "")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log = append(log, "Error sending request: " + err.Error())
		return TestResults{
			Success: false,
			Diff: log,
		}, err
	}
	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading body: " + err.Error())
	}
	bodyStr := string(bodyBytes)

	// test expectations
	var success = true
	if resp.StatusCode != expects.Status {
		log = append(log, fmt.Sprintf("Expected: %v \nGot: %v", expects.Status, resp.Status))
		success = false
	}
	sameJson, err := compareJson(expects.Body, bodyStr)
	if err != nil {
		log = append(log, "Error marshalling expected body: " + err.Error())
		return TestResults{
			Success: false,
			Diff: log,
		}, err
	}
	if !sameJson {
		log = append(log, fmt.Sprintf("Expected: %+v \nGot: %v", expects.Body, bodyStr))
		success = false
	}

	if success {
		return TestResults{
			Success: true,
			Diff: nil,
		}, nil
	} else {
		return TestResults{
			Success: false,
			Diff: log,
		}, nil
	}
}