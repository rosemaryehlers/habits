package main

import(
	//"fmt"
	"log"
	"math/rand"
	"net/http"
	"time"

	h "src/habits/lib/httptemplate"
)

func main() {
	l := &h.Lifecycle{}
	c := &h.Configurator{}

	s := h.CreateServer(h.NewRouter())

	s.AddRoute("GET", "/health", CheckHealth())

	l.AddStartupFunc(func() {
		log.Print("Starting")
		rand.Seed(time.Now().UnixNano())
		s.RegisterRoutes()
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

func CheckHealth() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}
}
// test