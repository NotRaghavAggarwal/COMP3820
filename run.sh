#!/usr/bin/env bash

sh build.sh

docker run --rm --name uq_fhir_cxrmate_api --publish 80:80 uq_fhir_cxrmate_api
 