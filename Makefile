include .env
export

deploy:
	npx cdk@2.56.0 deploy
watch:
	npx cdk@2.56.0 watch --hotswap
sso:
	aws sso login

build-ui:
	cd ui && npm ci -f && npm run build