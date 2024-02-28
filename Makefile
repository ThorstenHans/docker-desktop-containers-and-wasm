.PHONY: build
build:
	cd src/api && spin build
	docker compose build

.PHONY: run
run:
	docker compose up -d

.PHONY: stop
stop:
	docker compose down

.PHONY: logs
logs:
	docker compose logs