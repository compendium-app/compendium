package utils

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-sdk-go/aws/session"
	v4 "github.com/aws/aws-sdk-go/aws/signer/v4"
	"github.com/sony/appsync-client-go"
	"github.com/sony/appsync-client-go/graphql"
)

func GetAppSyncClient() (client *appsync.Client, err error) {
	return GetAppSyncClientWithURL(os.Getenv("COMPENDIUM_GRAPHQL_URL"))
}

func GetAppSyncClientWithURL(graphqlURL string) (client *appsync.Client, err error) {
	sess, err := session.NewSession()
	if err != nil {
		return
	}
	signer := v4.NewSigner(sess.Config.Credentials)
	client = appsync.NewClient(appsync.NewGraphQLClient(graphql.NewClient(graphqlURL)), appsync.WithIAMAuthorization(*signer, os.Getenv("AWS_REGION"), graphqlURL))
	return
}

func RunAppSyncQuery(ctx context.Context, client *appsync.Client, query string, vars map[string]interface{}, response interface{}) (err error) {
	variablesData, err := json.Marshal(vars)
	if err != nil {
		return
	}
	variables := json.RawMessage(variablesData)
	fmt.Println("data:", string(variablesData))
	res, err := client.Post(graphql.PostRequest{
		Query:     query,
		Variables: &variables,
	})
	if err != nil {
		return
	}
	if res.Errors != nil {
		err = fmt.Errorf("error: %v", res.Errors)
		return
	}

	err = res.DataAs(response)
	if err != nil {
		return
	}
	return
}
