# Nopeus GitHub Action

Nopeus (by [salfati.group](https://salfati.group)) adds an applicaiton layer to the cloud to simplify the deployment and adoption of microservices at scale.

## Usage:
```yaml
uses: salfatigroup/nopeus@v1
with:
    # override nopeus.yaml version (optional)
    release_version: v1.0.0
    # nopeus pro toke (optiona)
    nopeus_token: <YOUR TOKEN>
    # disable remote caching (optional. not recommended.)
    disable_cache: false
    # aws credentials
    aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
env:
    # nopeus access to private registries (optional)
    NOPEUS_DOCKER_SERVER: "<REGISTRY SERVER>"
    NOPEUS_DOCKER_USERNAME: "<USERNAME>"
    NOPEUS_DOCKER_PASSWORD: "<PASSWORD>"
    NOPEUS_DOCKER_EMAIL: "<EMAIL>"
```
