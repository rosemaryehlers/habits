package gobase

import (
	"os"
	"os/signal"
	"sync"
	"syscall"
)

type ReloadFunc func()
type StartupFunc func()
type ShutdownFunc func()

type Lifecycle struct {
	log           Logger
	reloadFuncs   []ReloadFunc
	startupFuncs  []StartupFunc
	shutdownFuncs []ShutdownFunc

	shutdownChan chan os.Signal
	exitCode     int
}

func (l *Lifecycle) Begin() {
	wg := &sync.WaitGroup{}

	reload := make(chan os.Signal, 1)
	signal.Notify(reload, syscall.SIGHUP)
	go func() {
		for {
			<-reload
			l.log.Warn("Reloading")
			for _, f := range l.reloadFuncs {
				f()
			}
		}
	}()

	wg.Add(1)
	l.shutdownChan = make(chan os.Signal, 1)
	signal.Notify(l.shutdownChan, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		defer wg.Done()
		<-l.shutdownChan
		l.log.Warn("Shutdown initiated")
		for _, f := range l.shutdownFuncs {
			f()
		}
		l.log.Warn("Exiting")
	}()

	l.log.Warn("Starting")
	for _, f := range l.startupFuncs {
		f()
	}

	wg.Wait() //Prevents main thread from exiting before completion of shutdown goroutine
	os.Exit(l.exitCode)
}

func (l *Lifecycle) Halt(code int) {
	l.exitCode = code
	l.shutdownChan <- syscall.SIGTERM
}

func (l *Lifecycle) AddReloadFunc(f ReloadFunc) {
	l.reloadFuncs = append(l.reloadFuncs, f)
}

func (l *Lifecycle) AddStartupFunc(f StartupFunc) {
	l.startupFuncs = append(l.startupFuncs, f)
}

func (l *Lifecycle) AddShutdownFunc(f ShutdownFunc) {
	l.shutdownFuncs = append(l.shutdownFuncs, f)
}
