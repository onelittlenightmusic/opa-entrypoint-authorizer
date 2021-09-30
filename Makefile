.PHONY: build
build:
	opa build -t wasm -e 'authz/allow' policy/
	tar -xzf ./bundle.tar.gz /policy.wasm
	tar cvzf bundle-raw.tar.gz policy/
	tar cvzf bundle-data.tar.gz permissions.json
