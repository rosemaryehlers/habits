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

### exec: ??? permission denied: unknown
May be due to the executable bit of the file not being set. To check, exec into the build container. `--entrypoint=` will override any other entrypoint arguments, whereas adding it at the end of the `run` command will add on to any existing entrypoint arguments.

Once in the container, ls -alh <filename>, and you want an x

If there's no x, set the executable bit on the host OS with `chmod +x <filename>`