include .env
export

run:
	go run main.go help
run-put:
	go run main.go put
run-configure:
	go run main.go configure

publish-latest:
	docker buildx build --platform linux/amd64 -t jakubknejzlik/compendium . && docker push jakubknejzlik/compendium
