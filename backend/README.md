### Helpful commands & notes

Run a go container for commands like `go mod tidy` and suchlike:
```
sudo docker run -it -v $(pwd):/app golang:1.20-alpine /bin/sh
```
Either be in the /src folder or update the source path to the src folder to correctly bind the folder to the container.