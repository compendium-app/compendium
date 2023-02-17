include .env
export

run:
	go run main.go help
run-put:
	go run main.go put

publish-latest:
	docker buildx build --platform linux/amd64 -t jakubknejzlik/compendium . && docker push jakubknejzlik/compendium
