package main

import(
	"fmt"
	"os"
	"path"
	"testing"

	tr "testrunner"
	//"views"

	"github.com/spf13/viper"
)

func main() { }

func TestMain(m *testing.M) {
	LoadConfig()
	domain := viper.GetString("Config.Domain")

	_ = tr.TestEnvvars{
		Domain: domain,
	}

	fmt.Println("Starting test run")
	e := m.Run()
	fmt.Println("Test run ended.")
	os.Exit(e)
}

func LoadConfig() {
	configFile := os.Getenv("CONFIG_FILE")

	fmt.Printf("Loading Config: %s", configFile)
	viper.SetConfigName(path.Base(configFile))
	viper.SetConfigType(path.Ext(configFile)[1:])
	viper.AddConfigPath(path.Dir(configFile))
	err := viper.ReadInConfig()
	if err != nil {
		fmt.Printf("Fatal error config file: %v, %v \n", configFile, err)
		return
	}
}