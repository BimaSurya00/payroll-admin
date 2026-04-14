#!/bin/bash
set -e

echo "=== Building HRIS Admin Docker Image ==="

IMAGE_NAME="admin-hris"
CONTAINER_NAME="hris-admin"

docker build -t $IMAGE_NAME .

echo "=== Build complete: $IMAGE_NAME ==="
