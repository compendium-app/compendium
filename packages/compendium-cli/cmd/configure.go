package cmd

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"os"

	"github.com/jakubknejzlik/compendium/utils"
	"github.com/urfave/cli"
	"gopkg.in/yaml.v3"
)

// NOTE: for now only puts new nodeTypes, but use it for other configuration needs

// Upserts/Puts nodeType nodes into database
var ConfigureCommand = cli.Command{
	Name: "configure",
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "filename,f",
			Value: ".compendium-config.yml",
		},
	},
	Action: func(c *cli.Context) error {
		filename := c.String("filename")
		fmt.Printf("configuring node types from %s\n", filename)
		err := configure(context.Background(), filename)
		if err != nil {
			return cli.NewExitError(err, 1)
		}

		return nil
	},
}

type NodeType struct {
	Id   string `json:"id" yaml:"id"`
	Name string `json:"name" yaml:"name"`
}
type Config struct {
	NodeTypes []NodeType `json:"nodeTypes" yaml:"nodeTypes"`
}

type NodeTypeExecution struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

func configure(ctx context.Context, filename string) (err error) {

	data, err := os.ReadFile(filename)
	if err != nil {
		return
	}

	decoder := yaml.NewDecoder(bytes.NewReader(data))

	var config Config
	for {
		err = decoder.Decode(&config)
		if err == io.EOF {
			break
		}
		if err != nil {
			return
		}
	}

	client, err := utils.GetAppSyncClient()
	if err != nil {
		return
	}

	query := `
    mutation putNodeTypes($id: ID!, $name: String!) {
        putNodeType(type: {id: $id, name: $name}) {
            id
            name
        }
    }
	`

	if config.NodeTypes == nil {
		fmt.Println("No node types to add")
		return
	}

	for _, nodeType := range config.NodeTypes {
		var res NodeTypeExecution
		err = utils.RunAppSyncQuery(ctx, client, query, map[string]interface{}{
			"id":   nodeType.Id,
			"name": nodeType.Name,
		}, &res)
		if err != nil {
			fmt.Println(err)
		} else {
			fmt.Printf("started adding nodeType: %s %s\n", res.Id, res.Name)
		}
	}

	return
}
