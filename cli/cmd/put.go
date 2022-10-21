package cmd

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"io/ioutil"

	"github.com/jakubknejzlik/compendium/utils"
	"github.com/urfave/cli"
	"gopkg.in/yaml.v2"
)

// PutCommand ...
var PutCommand = cli.Command{
	Name: "put",
	Flags: []cli.Flag{
		cli.StringFlag{
			Name:  "filename,f",
			Value: ".compendium.yml",
		},
	},
	Action: func(c *cli.Context) error {
		filename := c.String("filename")
		fmt.Println("putting file .compendium.yml")
		err := putFile(context.Background(), filename)
		if err != nil {
			return cli.NewExitError(err, 1)
		}

		return nil
	},
}

type NodeInput struct {
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	Metadata     map[string]interface{} `json:"metadata"`
	Dependencies []string               `json:"dependencies"`
}
type Execution struct {
	ExecutionArn string `json:"executionArn"`
}

func putFile(ctx context.Context, filename string) (err error) {

	data, err := ioutil.ReadFile(filename)
	if err != nil {
		return
	}

	var nodes []NodeInput

	dec := yaml.NewDecoder(bytes.NewReader(data))

	for {
		var node NodeInput
		err = dec.Decode(&node)
		if err == io.EOF {
			break
		}
		if err != nil {
			return
		}
		if node.Dependencies == nil {
			node.Dependencies = []string{}
		}
		if node.Metadata == nil {
			node.Metadata = map[string]interface{}{}
		}
		nodes = append(nodes, node)
	}

	client, err := utils.GetAppSyncClient()
	if err != nil {
		return
	}

	query := `
	mutation putNodes($nodes:[NodeInput!]!) {
		putNodes(nodes:$nodes){
		  executionArn
		}
	  }
	`

	var res Execution
	err = utils.RunAppSyncQuery(ctx, client, query, map[string]interface{}{
		"nodes": nodes,
	}, &res)

	fmt.Println("started execution", res.ExecutionArn)

	return
}
