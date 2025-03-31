# Meta Frontend

Frontend layer for the Meta schools evaluation system

#### Prestaging environment commands

```bash
docker compose -f 'docker-compose.pre_staging.yml' up -d --build

# docker build --tag meta_frontend_prestaging-app:latest -f Dockerfile.pre_staging .
# docker run --name meta_frontend_prestaging-app-1 -p 3000:3000 --detach 'meta_frontend_prestaging-app:latest' 

# Build and run the app
docker build -t meta_frontend_prestaging-app:latest -f Dockerfile.pre_staging .
docker run --name meta_frontend_prestaging-app-1 -p 3000:3000 --detach meta_frontend_prestaging-app:latest
```
