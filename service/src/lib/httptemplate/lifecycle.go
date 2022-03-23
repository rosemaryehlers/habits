package main

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
	reloadFuncs   []ReloadFunc
	startupFuncs  []StartupFunc
	shutdownFuncs []ShutdownFunc
}

func (l *Lifecycle) Begin() {
	wg := &sync.WaitGroup{}

	reload := make(chan os.Signal, 1)
	signal.Notify(reload, syscall.SIGHUP)
	go func() {
		for {
			<-reload
			for _, f := range l.reloadFuncs {
				f()
			}
		}
	}()

	wg.Add(1)
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		defer wg.Done()
		<-shutdown
		for _, f := range l.shutdownFuncs {
			f()
		}
	}()

	for _, f := range l.startupFuncs {
		f()
	}

	wg.Wait() //Prevents main thread from exiting before completion of shutdown goroutine
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