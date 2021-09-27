.PHONY: build
build:
	opa build -t wasm -e 'authz/allow' policy/
	tar -xzf ./bundle.tar.gz /policy.wasm