package tests

import(
	"bytes"
    "encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"sync"

	"github.com/spf13/viper"
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

var (
	domain string
	domainOnce sync.Once
)

func GetDomain() string {
	domainOnce.Do(func() {
		configFile := os.Getenv("CONFIG_FILE")
		viper.SetConfigName(path.Base(configFile))
		viper.SetConfigType(path.Ext(configFile)[1:])
		viper.AddConfigPath(path.Dir(configFile))
		err := viper.ReadInConfig()
		if err != nil {
			fmt.Printf("Fatal error config file: %v, %v \n", configFile, err)
			return
		}
		domain = viper.GetString("Config.Domain")

	})
	return domain
}
// this is super sus
func compareJson(expects any, actual string) (bool, error) {
	jsonStr, err := json.Marshal(expects)
	if err != nil {
		return false, err
	}
	return string(jsonStr) == actual, nil
}

func HttpTest(name string, reqInputs RequestInputs, expects Expects) {
	results, err := doHttpTest(reqInputs, expects)
	if err != nil {
		fmt.Printf("%v: Error, could not complete. %v \n", name, err)
		return
	}
	if results.Success {
		fmt.Printf("%v: Success \n", name)
	} else {
		fmt.Printf("%v: Failed \n", name)
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

	url := "http://" + GetDomain() + reqInputs.Path
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