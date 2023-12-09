package main

import(
	"fmt"
	"os"
	"testing"

	"testsv2/tests"
	"gobase"
)

func TestMain(m *testing.M) {
	d := tests.GetDomain()
	fmt.Println("Domain: " + d)

	l := gobase.NewLogger()
    db := gobase.NewRepository(l)
	tests.SetDB(db)

	if db == nil {
		fmt.Println("Repo set to nil")
	} else {
		fmt.Println("Repo set")
	}

	os.Exit(m.Run())
}