#!/bin/bash

set -euo pipefail

RESOURCE_GROUP="${RESOURCE_GROUP:-sql-azure1}"
ACR_NAME="${ACR_NAME:-niveshakregistry}"
APP_NAME="${APP_NAME:-chat-engine-app}"
IMAGE_NAME="${IMAGE_NAME:-chat-engine}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
USE_ACR_BUILD="${USE_ACR_BUILD:-auto}"

IMAGE_REF="$ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG"
APP_URL="https://$APP_NAME.azurewebsites.net"

echo "=== Azure Deploy Script for Chat Engine ==="
echo "Image: $IMAGE_REF"
echo "App: $APP_NAME"

if ! az account show >/dev/null; then
  echo "Azure CLI is not logged in. Run 'az login' and try again."
  exit 1
fi

if [ "$USE_ACR_BUILD" = "true" ] || { [ "$USE_ACR_BUILD" = "auto" ] && ! command -v docker >/dev/null 2>&1; }; then
  echo "Building and pushing image with Azure Container Registry remote build..."
  az acr build \
    --registry "$ACR_NAME" \
    --image "$IMAGE_NAME:$IMAGE_TAG" \
    .
else
  echo "Logging in to Azure Container Registry..."
  az acr login --name "$ACR_NAME"

  echo "Building Docker image locally..."
  docker build -t "$IMAGE_REF" .

  echo "Pushing Docker image to ACR..."
  docker push "$IMAGE_REF"
fi

echo "Ensuring App Service points at the latest image..."
az webapp config container set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --container-image-name "$IMAGE_REF" \
  --container-registry-url "https://$ACR_NAME.azurecr.io" \
  >/dev/null

echo "Ensuring WebSockets, Always On, HTTPS-only, and container CD are enabled..."
az webapp config set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --web-sockets-enabled true \
  --always-on true \
  >/dev/null

az webapp update \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --https-only true \
  >/dev/null

az webapp deployment container config \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --enable-cd true \
  >/dev/null

if [ -n "${AZURE_WEBAPP_PUBLISH_PROFILE:-}" ]; then
  echo "Triggering App Service container refresh via SCM webhook..."
  CREDS=$(
    python3 -c "
import os
import sys
import xml.etree.ElementTree as ET

try:
    root = ET.fromstring(os.environ['AZURE_WEBAPP_PUBLISH_PROFILE'])
    for profile in root.findall('publishProfile'):
        if profile.attrib.get('publishMethod') == 'MSDeploy':
            print(profile.attrib.get('userName') + ':' + profile.attrib.get('userPWD'))
            sys.exit(0)
except Exception as exc:
    print(f'Error parsing publish profile: {exc}', file=sys.stderr)
sys.exit(1)
"
  )

  curl -f -X POST -u "$CREDS" \
    -H "Content-Type: application/json" \
    "https://$APP_NAME.scm.azurewebsites.net/api/registry/webhook"
else
  echo "Restarting App Service to pull the latest image..."
  az webapp restart \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP"
fi

echo "=== Deployment triggered successfully! ==="
echo "App URL: $APP_URL"
