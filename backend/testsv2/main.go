package main

import(
	"fmt"
	"os"
	"testing"

	"tests"
)

func main() { }

func TestMain(m *testing.M) {
	tests.GetDomain()

	fmt.Println("Starting test run")
	e := m.Run()
	fmt.Println("Test run ended.")
	os.Exit(e)
}