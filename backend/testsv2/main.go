package main

import(
	"fmt"
	"os"
	"path"

	tr "testrunner"
	"views"

	"github.com/spf13/viper"
)

func main() {
	LoadConfig()
	domain := viper.GetString("Config.Domain")

	testEnvvars := tr.TestEnvvars{
		Domain: domain,
	}

	fmt.Println("Starting test run")

	tests := views.Tests()
	for i := 0; i < len(tests); i++ {
		tests[i](&testEnvvars)
	}

	fmt.Println("Test run ended.")
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