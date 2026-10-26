# AWS Production Deployment Guide

## Overview

VisionSentinel AI is engineered for production deployment on Amazon Web Services (AWS) using containerized compute and least-privilege cloud services.

```
                    +------------------------------------------+
                    |          Amazon Route 53 (DNS)           |
                    +--------------------+---------------------+
                                         |
                                         v
                    +------------------------------------------+
                    |       AWS CloudFront (CDN / TLS 1.3)     |
                    +--------------------+---------------------+
                                         |
                                         v
                    +------------------------------------------+
                    |    Application Load Balancer (ALB)       |
                    +--------------------+---------------------+
                                         |
                                         v
                    +------------------------------------------+
                    |       AWS ECS Fargate Cluster            |
                    |   (VisionSentinel Container Service)     |
                    +--------------------+---------------------+
                         |                       |
                         v                       v
               +------------------+    +------------------+
               | Amazon S3 Bucket |    |   AWS Secrets    |
               | (Private Video   |    |     Manager      |
               |  Buffers, KMS)   |    | (Gemini Secrets) |
               +------------------+    +------------------+
```

## Why ECS Fargate Over AWS Lambda?

- **Continuous CPU Video Decoding**: Video processing using OpenCV requires continuous CPU instruction pipelines and memory allocation beyond standard Lambda execution limits.
- **Large Native Binaries**: OpenCV, FFmpeg, and Python libraries benefit from containerized pre-warmed memory, avoiding multi-second cold-start initialization.
- **Cost Efficiency for Long Streams**: Fargate pricing scales linearly with vCPU/RAM duration without 15-minute Lambda timeouts.

## Step-by-Step Setup

### 1. Build and Push Container Image to Amazon ECR
```bash
# Authenticate Docker to your AWS ECR registry
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build Docker image
docker build -t visionsentinel-engine -f backend/Dockerfile .

# Tag and push
docker tag visionsentinel-engine:latest <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/visionsentinel:latest
docker push <YOUR_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/visionsentinel:latest
```

### 2. Configure AWS Secrets Manager
Store `GEMINI_API_KEY` in AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
    --name "visionsentinel/gemini-api-key" \
    --description "Gemini 3.8 Flash API Key for VisionSentinel AI" \
    --secret-string '{"GEMINI_API_KEY":"your_key_here"}'
```

### 3. Deploy ECS Fargate Task Definition
Define container with:
- CPU: 2048 (2 vCPU)
- Memory: 4096 (4 GB)
- IAM Execution Role: `AmazonECSTaskExecutionRolePolicy` + `SecretsManagerReadWrite` for `visionsentinel/*`
- Port Mappings: 3000 (Full-stack Express) or 8000 (Python microservice)

### 4. S3 Bucket Security Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EnforceTLSRequestsOnly",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::visionsentinel-secure-buffer/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```
Lifecycle rule: Expire all temporary video buffer objects after 1 day.
