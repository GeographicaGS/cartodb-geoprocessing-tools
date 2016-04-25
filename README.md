# CartoDB Geoprocessing Tools

Install submodules
```
git submodule init && git submodule update
```

Build and start
```
docker-compose
```

## DEV environment

1. Start Web container

  ```
  docker-compose up -d www
  ```
2. Install dependencies at your folder

  ```
  docker-compose run builder npm install
  ```
3. Run builder watcher. Rebuild when a file changes.

  ```
  docker-compose run builder npm run-script builder-watcher
  ```
