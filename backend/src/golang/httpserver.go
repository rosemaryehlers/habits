package habits

import (
	"context"
	"net/http"
)

type HttpServer struct {
	log    Logger
	router *Router
	http   *http.Server
}

func (s *HttpServer) Start() {
	s.http = &http.Server{
		Addr:    ":80",
		Handler: s.router,
	}

	s.log.Warn("HTTP server listening")
	go func() {
		if err := s.http.ListenAndServe(); err != nil {
			if err.Error() != "http: Server closed" {
				s.log.Error("HTTP server closed with: %v\n", err)
			}
			s.log.Warn("HTTP server shut down")
		}
	}()
}

func (s *HttpServer) Stop() {
	if s.http != nil {
		s.http.Shutdown(context.Background())
	}
}