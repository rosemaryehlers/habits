package habits

import (
	"fmt"
	"regexp"
	"time"

	"github.com/spf13/viper"
)

type LogLevel uint8

const (
	FATAL LogLevel = iota
	ERROR
	WARN
	INFO
	TRACE
	DEBUG
)

var (
	loglevelRegex = regexp.MustCompile(`(?i)^(fatal)?(error)?(warn(?:ing)?)?(info(?:rmation)?)?(trace)?(debug)?$`)
)

func ParseLogLevel(level string) LogLevel {
	m := loglevelRegex.FindStringSubmatch(level)
	if m == nil {
		return LogLevel(255)
	}

	for i, lvl := range m[1:] {
		if lvl != "" {
			return LogLevel(i)
		}
	}

	return LogLevel(255)
}

type Logger interface {
	Debug(line string, vars ...interface{})
	Trace(line string, vars ...interface{})
	Info(line string, vars ...interface{})
	Warn(line string, vars ...interface{})
	Error(line string, vars ...interface{})
	Fatal(line string, vars ...interface{})
}

type logger struct {
	loglevel   LogLevel
	timeformat string
}

func NewLogger() *logger {
	return &logger{
		loglevel:   WARN,
		timeformat: time.RFC3339,
	}
}

func (l *logger) Reload() {
	loglevel := ParseLogLevel(viper.GetString("Log.Level"))
	if loglevel > DEBUG {
		l.Warn("Specified Log.Level out of range: %v", loglevel)
	}
	l.loglevel = loglevel
}

func (l *logger) write(level LogLevel, line string, vars ...interface{}) {
	if l.loglevel >= level {
		fmt.Printf("%v: %v\n", time.Now().Format(l.timeformat), fmt.Sprintf(line, vars...))
	}
}

func (l *logger) Debug(line string, vars ...interface{}) {
	l.write(DEBUG, line, vars...)
}

func (l *logger) Trace(line string, vars ...interface{}) {
	l.write(TRACE, line, vars...)
}

func (l *logger) Info(line string, vars ...interface{}) {
	l.write(INFO, line, vars...)
}

func (l *logger) Warn(line string, vars ...interface{}) {
	l.write(WARN, line, vars...)
}

func (l *logger) Error(line string, vars ...interface{}) {
	l.write(ERROR, line, vars...)
}

func (l *logger) Fatal(line string, vars ...interface{}) {
	panic(fmt.Sprintf("%v: %v\n", time.Now().Format(l.timeformat), fmt.Sprintf(line, vars...)))
}