#!/bin/bash

set -e

RESOURCE_GROUP="${RESOURCE_GROUP:-sql-azure1}"
LOCATION="${LOCATION:-centralindia}"
ACR_NAME="${ACR_NAME:-niveshakregistry}"
PLAN_NAME="${PLAN_NAME:-niveshak-plan}"
APP_NAME="${APP_NAME:-chat-engine-app}"
IMAGE_NAME="${IMAGE_NAME:-chat-engine}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "=== Azure Resource Setup Script for Chat Engine ==="

if [ -z "$CONNECTION_URL" ]; then
  read -s -p "Enter MongoDB CONNECTION_URL: " CONNECTION_URL
  echo ""
fi

if [ -z "$JWT_SECRET" ]; then
  if command -v openssl >/dev/null 2>&1; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo "Generated JWT_SECRET for Azure App Service."
  else
    read -s -p "Enter JWT_SECRET: " JWT_SECRET
    echo ""
  fi
fi

if [ -z "$CONNECTION_URL" ]; then
  echo "CONNECTION_URL is required."
  exit 1
fi

az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "Ensuring required Azure resource providers are registered..."
az provider register --namespace Microsoft.ContainerRegistry --wait
az provider register --namespace Microsoft.Web --wait

echo "Checking/creating Azure Container Registry: $ACR_NAME..."
if ! az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  az acr create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$ACR_NAME" \
    --sku Basic \
    --admin-enabled true
else
  echo "ACR $ACR_NAME already exists. Skipping creation."
fi

echo "Retrieving ACR credentials..."
ACR_USER=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query username -o tsv)
ACR_PASS=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "passwords[0].value" -o tsv)

echo "Checking/creating App Service Plan: $PLAN_NAME..."
if ! az appservice plan show --name "$PLAN_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  az appservice plan create \
    --name "$PLAN_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --sku B1 \
    --is-linux
else
  echo "App Service Plan $PLAN_NAME already exists. Skipping creation."
fi

IMAGE_REF="$ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG"

echo "Checking/creating Web App: $APP_NAME..."
if ! az webapp show --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" &>/dev/null; then
  az webapp create \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$PLAN_NAME" \
    --deployment-container-image-name "$IMAGE_REF"
else
  echo "Web App $APP_NAME already exists. Skipping creation."
fi

echo "Enabling SCM and FTP Basic Publishing Credentials on the Web App..."
az resource update --resource-group "$RESOURCE_GROUP" --name scm --namespace Microsoft.Web --resource-type basicPublishingCredentialsPolicies --parent "sites/$APP_NAME" --set properties.allow=true
az resource update --resource-group "$RESOURCE_GROUP" --name ftp --namespace Microsoft.Web --resource-type basicPublishingCredentialsPolicies --parent "sites/$APP_NAME" --set properties.allow=true

echo "Configuring container settings and registry access on Web App..."
az webapp config container set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --docker-custom-image-name "$IMAGE_REF" \
  --docker-registry-server-url "https://$ACR_NAME.azurecr.io" \
  --docker-registry-server-user "$ACR_USER" \
  --docker-registry-server-password "$ACR_PASS"

echo "Enabling WebSockets and Always On on Web App..."
az webapp config set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --web-sockets-enabled true \
  --always-on true

az webapp update \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --https-only true

APP_URL="https://$APP_NAME.azurewebsites.net"

echo "Configuring application environment settings..."
az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    CONNECTION_URL="$CONNECTION_URL" \
    JWT_SECRET="$JWT_SECRET" \
    CORS_ORIGIN="$APP_URL" \
    CHAT_ENGINE_API_URL="http://127.0.0.1:8080" \
    NEXT_PUBLIC_APP_URL="$APP_URL" \
    NODE_ENV="production" \
    SERVE_NEXT="true" \
    PORT="8080" \
    WEBSITES_PORT="8080"

echo "=== Setup completed successfully! ==="
echo "Your app is configured and will start once the image is pushed to the registry."
echo "App URL: $APP_URL"
