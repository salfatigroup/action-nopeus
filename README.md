# Nopeus GitHub Action

Nopeus (by [salfati.group](https://salfati.group)) adds an applicaiton layer to the cloud to simplify the deployment and adoption of microservices at scale.


Nopeus provide a pre-made custom GitHub Action `salfatigroup/action-nopeus`.  If you’re using the premium version of nopeus, this setup is all that you need 🤩

```yaml
name: CD

on:
  push:
    branches:
      - main

jobs:
  nopeus:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Noepus Deploy
        uses: salfatigroup/action-nopeus@main
        with:
          aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        env:
          NOPEUS_DOCKER_SERVER: ${{ secrets.NOPEUS_DOCKER_SERVER }}
          NOPEUS_DOCKER_USERNAME: ${{ secrets.NOPEUS_DOCKER_USERNAME }}
          NOPEUS_DOCKER_PASSWORD: ${{ secrets.NOPEUS_DOCKER_PASSWORD }}
          NOPEUS_DOCKER_EMAIL: ${{ secrets.NOPEUS_DOCKER_EMAIL }}
          NOPEUS_TOKEN: ${{ secrets.NOPEUS_TOKEN }}
```

If you’re using the free version of nopeus, it is recommended to store all the `*.nopeus.state` files and reuse them later. Here’s an example of a full workflow for the OSS version.

```yaml
name: CD

on:
  push:
    branches:
      - main

jobs:
  nopeus:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Download last artifact
        uses: blablacar/action-download-last-artifact@master
        continue-on-error: true
        with:
          name: nopeus-state
          path: .nopeus/state/

      - name: Noepus Deploy
        uses: salfatigroup/action-nopeus@main
        with:
          aws_access_key_id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_access_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        env:
          NOPEUS_DOCKER_SERVER: ${{ secrets.NOPEUS_DOCKER_SERVER }}
          NOPEUS_DOCKER_USERNAME: ${{ secrets.NOPEUS_DOCKER_USERNAME }}
          NOPEUS_DOCKER_PASSWORD: ${{ secrets.NOPEUS_DOCKER_PASSWORD }}
          NOPEUS_DOCKER_EMAIL: ${{ secrets.NOPEUS_DOCKER_EMAIL }}
          NOPEUS_TOKEN: ${{ secrets.NOPEUS_TOKEN }}

      - name: Upload Nopeus State
        uses: actions/upload-artifact@v3
        with:
          name: nopeus-state
          path: |
            .nopeus/state/*
```
