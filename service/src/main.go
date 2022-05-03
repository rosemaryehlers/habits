package main

import(
	//"fmt"
	"log"
	"math/rand"
	//"net/http"
	"time"
)

func main() {
	l := &Lifecycle{}
	c := &Configurator{}

	s := &server{
		router: NewRouter(),
		db:     d,
		wa:     w,
		redis:  r,
		users:  u,
	}

	l.AddStartupFunc(func() {
		log.Print("Starting")
		rand.Seed(time.Now().UnixNano())
		s.routes()
		c.LoadConfig()
		s.Start()
	})

	l.AddShutdownFunc(func() {
		log.Println("Shutdown initiated")
		s.Stop()
		log.Printf("Exiting")
	})

	l.AddReloadFunc(c.LoadConfig)

	l.Begin()
}
// test