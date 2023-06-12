### Helpful commands & notes

Run a go container for commands like `go mod tidy` and suchlike:
```
docker run -it -v $(pwd):/app -w /app golang:1.20-alpine /bin/sh
```
Sets the current directory as the volume.

### FOLDERS ARE FORBIDDEN
You always forget that anything inside a folder is no longer part of the package, because golang hates you. You have to use a `replace` in the go.mod file to point the import to the local folder.
```
module no.com/habits/v2

go 1.20

require (
    gobase v1.0.0
)

replace gobase v1.0.0 => /golang
```
You can now import it as 'gobase' into other packages.

### The package being executed must be named main. Only library packages can have custom names