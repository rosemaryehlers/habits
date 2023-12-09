package gobase

import (
	"os"

	"github.com/robfig/cron/v3"
)

type Application struct {
	Logger    Logger
	Lifecycle *Lifecycle
	Config    *Configurator
}

func NewApplication() *Application {
	l := NewLogger()

	a := &Application{
		Logger:    l,
		Lifecycle: &Lifecycle{log: l},
		Config:    &Configurator{log: l},
	}

	a.Lifecycle.AddStartupFunc(a.Config.LoadConfig)
	a.Lifecycle.AddReloadFunc(a.Config.LoadConfig)

	a.Config.AddConfigFunc(l.Reload)

	return a
}

func (a *Application) WithHttpServer() *Router {
	r := NewRouter(a.Logger)
	s := &HttpServer{log: a.Logger, router: r}

	a.Lifecycle.AddStartupFunc(s.Start)
	a.Lifecycle.AddShutdownFunc(s.Stop)

	return r
}

func (a *Application) WithCron(f func()) {
	cron := cron.New(cron.WithSeconds())
	a.Lifecycle.AddStartupFunc(cron.Start)
	a.Lifecycle.AddShutdownFunc(func() {
		cron.Stop()
	})

	//BOZO Make this a std ini setting
	_, err := cron.AddFunc(os.Getenv("CRON_SCHEDULE"), f)
	if err != nil {
		a.Logger.Error("Error setting crontab: %v", err)
		os.Exit(1)
	}
}