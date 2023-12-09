package gobase

import (
	"os"
	"path"

	"github.com/spf13/viper"
)

type ConfigFunc func()

type Configurator struct {
	log         Logger
	configFuncs []ConfigFunc
}

func (c *Configurator) AddConfigFunc(f ConfigFunc) {
	c.configFuncs = append(c.configFuncs, f)
}

func (c *Configurator) LoadConfig() {
	configFile := os.Getenv("CONFIG_FILE")

	c.log.Warn("Loading Config: %s", configFile)
	viper.SetConfigName(path.Base(configFile))
	viper.SetConfigType(path.Ext(configFile)[1:])
	viper.AddConfigPath(path.Dir(configFile))
	err := viper.ReadInConfig()
	if err != nil {
		c.log.Fatal("Fatal error config file: %v, %v \n", configFile, err)
		return
	}

	for _, f := range c.configFuncs {
		f()
	}
}
