FROM golang as builder

ENV GO111MODULE=on
WORKDIR /go/src/gitlab.com/jakubknejzlik/compendium

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -p 1 -a -installsuffix cgo -o /tmp/app main.go

FROM alpine

# RUN apk update && apk add ca-certificates && rm -rf /var/cache/apk/*

WORKDIR /app

COPY --from=builder /tmp/app /usr/local/bin/compendium

# https://serverfault.com/questions/772227/chmod-not-working-correctly-in-docker
RUN chmod +x /usr/local/bin/compendium

ENTRYPOINT []
CMD [ "/bin/sh", "-c", "compendium help"]
