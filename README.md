# Nopeus GitHub Action

Nopeus (by [salfati.group](https://salfati.group)) adds an applicaiton layer to the cloud to simplify the deployment and adoption of microservices at scale.

## Usage:
```yaml
uses: salfatigroup/nopeus@v1
with:
    # override nopeus.yaml version (optional)
    release_version: v1.0.0
    # disable remote caching (optional. not recommended.)
    disable_cache: false
    # aws credentials
    aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
env:
    # nopeus access to private registries (optional)
    NOPEUS_DOCKER_SERVER: ${{ secrets.NOPEUS_DOCKER_SERVER }}
    NOPEUS_DOCKER_USERNAME: ${{ secrets.NOPEUS_DOCKER_USERNAME }}
    NOPEUS_DOCKER_PASSWORD: ${{ secrets.NOPEUS_DOCKER_PASSWORD }}
    NOPEUS_DOCKER_EMAIL: ${{ secrets.NOPEUS_DOCKER_EMAIL }}
    # nopeus pro token
    NOPEUS_TOKEN: ${{ secrets.NOPEUS_TOKEN }}
```
