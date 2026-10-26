#!/usr/bin/env bash
# ==============================================================================
# VisionSentinel AI - Safe AWS Production Deployment Script
# OpenCV AI Competition 2026 (Powered by AWS)
# 
# Security Principle: Uses ONLY authenticated AWS CLI credentials, IAM roles,
# or AWS SSO. Never prompts for, exposes, or hardcodes secret keys.
# ==============================================================================

set -euo pipefail

REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-us-east-1}}"
APP_NAME="visionsentinel"
IMAGE_TAG="$(git rev-parse --short HEAD 2>/dev/null || echo "v1.0.0")"

echo "================================================================================"
echo " VisionSentinel AI - AWS Production Deployment (ECS Fargate + ECR)"
echo " Competition: OpenCV AI Competition 2026"
echo "================================================================================"

# Step 1: Verify prerequisites
if ! command -v aws &> /dev/null; then
  echo "[-] Error: 'aws' CLI is not installed or not in PATH."
  echo "    Install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

if ! command -v docker &> /dev/null; then
  echo "[-] Error: 'docker' is not running or not found in PATH."
  echo "    Start Docker daemon to build container images."
  exit 1
fi

# Step 2: Verify active AWS authentication
echo "[*] Checking AWS authentication identity..."
CALLER_IDENTITY=$(aws sts get-caller-identity --output json 2>&1) || {
  echo "[-] Error: AWS authentication failed or credentials not configured."
  echo "    To authenticate safely, use one of the following methods:"
  echo "    1. AWS IAM Identity Center: 'aws sso login --profile <profile>'"
  echo "    2. AWS CLI profile: 'aws configure --profile <profile>'"
  echo "    3. Environment IAM role (e.g., inside AWS CloudShell or EC2 instance)"
  echo "    Never commit raw AWS access keys or passwords to the repository."
  exit 1
}

ACCOUNT_ID=$(echo "$CALLER_IDENTITY" | grep -o '"Account": "[^"]*' | cut -d'"' -f4)
IAM_ARN=$(echo "$CALLER_IDENTITY" | grep -o '"Arn": "[^"]*' | cut -d'"' -f4)

echo "[+] Authenticated as: ${IAM_ARN}"
echo "[+] Target AWS Account: ${ACCOUNT_ID}"
echo "[+] AWS Region: ${REGION}"

ECR_URI_WEB="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-web"
ECR_URI_CV="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${APP_NAME}-cv-backend"

# Step 3: Ensure ECR repositories exist
echo "[*] Ensuring Amazon ECR repositories exist..."
aws ecr describe-repositories --repository-names "${APP_NAME}-web" --region "${REGION}" >/dev/null 2>&1 || \
  aws ecr create-repository --repository-name "${APP_NAME}-web" --region "${REGION}" >/dev/null

aws ecr describe-repositories --repository-names "${APP_NAME}-cv-backend" --region "${REGION}" >/dev/null 2>&1 || \
  aws ecr create-repository --repository-name "${APP_NAME}-cv-backend" --region "${REGION}" >/dev/null

# Step 4: Authenticate Docker to ECR
echo "[*] Authenticating Docker with Amazon ECR..."
aws ecr get-login-password --region "${REGION}" | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Step 5: Build container images
echo "[*] Building Full-Stack Web image (Dockerfile)..."
docker build -t "${APP_NAME}-web:${IMAGE_TAG}" -t "${ECR_URI_WEB}:${IMAGE_TAG}" -t "${ECR_URI_WEB}:latest" .

echo "[*] Building OpenCV Microservice image (backend/Dockerfile)..."
docker build -t "${APP_NAME}-cv-backend:${IMAGE_TAG}" -t "${ECR_URI_CV}:${IMAGE_TAG}" -t "${ECR_URI_CV}:latest" -f backend/Dockerfile .

# Step 6: Push images to ECR
echo "[*] Pushing container images to Amazon ECR..."
docker push "${ECR_URI_WEB}:${IMAGE_TAG}"
docker push "${ECR_URI_WEB}:latest"
docker push "${ECR_URI_CV}:${IMAGE_TAG}"
docker push "${ECR_URI_CV}:latest"

echo "[+] ECR container images pushed successfully."

# Step 7: Render Task Definition
TASK_DEF_FILE="aws/ecs-task-definition.rendered.json"
sed -e "s/<AWS_ACCOUNT_ID>/${ACCOUNT_ID}/g" \
    -e "s/<AWS_REGION>/${REGION}/g" \
    aws/ecs-task-definition.json > "${TASK_DEF_FILE}"

echo "[*] Registering task definition in ECS..."
REGISTERED_TASK_ARN=$(aws ecs register-task-definition --cli-input-json "file://${TASK_DEF_FILE}" --region "${REGION}" --query 'taskDefinition.taskDefinitionArn' --output text)
echo "[+] Registered task definition: ${REGISTERED_TASK_ARN}"

# Step 8: Update ECS Service if cluster exists
CLUSTER_NAME="${APP_NAME}-cluster"
SERVICE_NAME="${APP_NAME}-service"

if aws ecs describe-clusters --clusters "${CLUSTER_NAME}" --region "${REGION}" --query 'clusters[?status==`ACTIVE`].clusterName' --output text | grep -q "${CLUSTER_NAME}"; then
  echo "[*] Updating active ECS Fargate service..."
  aws ecs update-service --cluster "${CLUSTER_NAME}" --service "${SERVICE_NAME}" --task-definition "${REGISTERED_TASK_ARN}" --region "${REGION}" >/dev/null
  echo "[+] ECS service updated successfully."
else
  echo "[i] ECS cluster '${CLUSTER_NAME}' not yet provisioned. Use CloudFormation template (aws/cloudformation-template.yaml) to launch the cluster and ALB."
fi

rm -f "${TASK_DEF_FILE}"
echo "================================================================================"
echo " VisionSentinel AI - AWS Deployment Stage Complete!"
echo "================================================================================"
