include .env
export

tfenv:
	tfenv use 1.2.9
init: tfenv
	terraform init
plan:
	terraform plan
apply:	
	terraform apply
destroy:	
	terraform destroy
sso:
	aws sso login

build-ui:
	cd ui && npm ci -f && npm run build