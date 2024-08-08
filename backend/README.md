# ask-me-anything

## How to start a GO project:

go mod init <github-repo-path>
ex: go mod init github.com/bbcvasconcellos/ask-me-anything

## Docker tips

volumes: everything that is stored in an instanced database in docker will be saved in a folder in the host machine in order to not lose that data
driver: where the files from docker will be cloned to. ex: local, aws, azure, etc

## Migrations with Go

[jackc/tern](https://github.com/jackc/tern)
Tool to do DB migration
creating a migration directory:

1. mkdir internal/store/pgstore (internal is on of the specific directory in GO. Any code inside the internal directory can't be used outside its module. It is usually composed by binary code which wont be useful to be used as a Lib)
2. to initialize tern and where the migrations will be initialized:

- tern init <path/to/project>

3. If the terminal does not recognize the "tern" command do the following in the Terminal:
   a) get the Go path on your local machine: go env GOPATH
   b) open /.zshrc: code ~/.zshrc
   c) add the following line: export PATH=$PATH:/Users/brunovasconcellos/go/bin
   d) run the zshrc file: source ~/.zshrc

4. Creating a new migration:

- tern new name_of_migration <path>
- or: tern new --migrations ./internal/store/pgstore/migrations <table_name>

5. Running a migration:

- obs: tern does not read env files, so we must do it manually. Hence, follow the steps:
  a)create a directory cmd/tools/terndotenv/main.go
  b)run the following command: go run cmd/tools/terndotenv/main.go (in this main file it contains the set of instructions to run the migrations)

6. Represent database entities:

- download SQLC
- create a config file for sqlc => sqlc.yaml inside the internal folder
- run: sqlc generate -f <path/to/sqlc.yml>
- it will automatically generate the models and the queries for our database based on the schema(migrations)

OBS: go mod tidy -> go will download all required and extra packages

## Go

1. gen.go file:

- a file with a set of commands/instructions to run
  -to run a gen.go file simply go to the terminal and run the following command: go generate ./...
