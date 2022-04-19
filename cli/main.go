package main

import (
	"os"

	"github.com/urfave/cli"

	"github.com/jakubknejzlik/compendium/cmd"
)

func main() {

	app := cli.NewApp()
	app.Name = "Compendium"
	app.Usage = "Compendium CLI"
	app.Version = "0.1.0"

	app.Commands = []cli.Command{
		cmd.PutCommand,
	}

	app.Run(os.Args)
}
