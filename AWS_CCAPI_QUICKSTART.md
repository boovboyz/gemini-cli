# AWS CCAPI MCP Server - Quick Start Guide

Get up and running with AWS Cloud Control API in Gemini CLI in 3 minutes.

## Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./scripts/setup-aws-ccapi.sh

# Load environment variables
source .env

# Start using
gemini "List my EC2 instances"
```

## Option 2: Manual Setup

### Step 1: Copy Configuration

```bash
cp .gemini-settings.aws-ccapi.json .gemini-settings.json
```

### Step 2: Set Environment Variables

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
export XAI_API_KEY="xai-..."  # if using Grok
```

### Step 3: Run Gemini CLI

```bash
gemini "Create an S3 bucket called my-test-bucket"
```

## Configuration Summary

This preconfiguration includes:

✅ **AWS CCAPI MCP Server** - Full access to 1,100+ AWS resources ✅
**Environment Variable Auth** - Uses AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
✅ **Checkov Disabled** - Security scanning turned off for faster operations ✅
**Trusted Server** - No confirmation prompts for operations ⚠️ **Region:
us-east-1** - Change in configuration if needed

## What You Can Do

### Query Resources

```
"List all my S3 buckets"
"Show me my Lambda functions"
"What EC2 instances are running?"
```

### Create Resources

```
"Create an S3 bucket called analytics-data with versioning"
"Deploy a Lambda function called hello-world with Node.js runtime"
"Create a t3.micro EC2 instance in subnet-abc123"
```

### Get Information

```
"Show me the CloudFormation schema for AWS::DynamoDB::Table"
"What properties can I set on an S3 bucket?"
"Generate a template for an RDS MySQL instance"
```

### Manage Resources

```
"Add a tag Environment=Production to bucket my-data"
"Update my Lambda function timeout to 60 seconds"
"Delete the S3 bucket called old-test-bucket"
```

## Security Notice

⚠️ **This configuration has security scanning DISABLED**

- No automatic checks for overly permissive IAM policies
- No validation of public access configurations
- **You are responsible** for ensuring secure resource configurations
- Recommended for development/testing only

To enable security scanning, edit `.gemini-settings.json`:

```json
{
  "env": {
    "SECURITY_SCANNING": "enabled"
  }
}
```

## Supported AWS Services

The server supports 1,100+ resource types including:

| Service        | Examples                             |
| -------------- | ------------------------------------ |
| **Compute**    | EC2, Lambda, ECS, EKS                |
| **Storage**    | S3, EBS, EFS                         |
| **Database**   | RDS, DynamoDB, ElastiCache           |
| **Networking** | VPC, Security Groups, Load Balancers |
| **Security**   | IAM, KMS, Secrets Manager            |
| **Analytics**  | Kinesis, Athena, Glue                |
| **AI/ML**      | SageMaker                            |
| **Containers** | ECR, ECS, EKS                        |

## Troubleshooting

### "Command 'uvx' not found"

```bash
# Install uv
pip install uv
# or
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### "Access Denied" Errors

- Check IAM permissions for your credentials
- Verify credentials: `aws sts get-caller-identity`
- Review required permissions for specific resource type

### "Region not found" Issues

- Set AWS_REGION environment variable
- Or specify in command: "in us-west-2"

## Read-Only Mode

To explore AWS resources without modification risk:

Edit `.gemini-settings.json`:

```json
{
  "args": ["awslabs.ccapi-mcp-server@latest", "--readonly"]
}
```

## Next Steps

1. ✅ Set up configuration (done!)
2. 📖 Read full documentation:
   [AWS_CCAPI_MCP_SETUP.md](./AWS_CCAPI_MCP_SETUP.md)
3. 🔒 Review security best practices
4. 🚀 Start managing AWS resources with natural language!

## Example Session

```bash
$ gemini

You: "What AWS account am I using?"
Gemini: Uses get_aws_account_info() → "Account ID: 123456789012, Region: us-east-1"

You: "List my S3 buckets"
Gemini: Uses list_resources() → "You have 3 S3 buckets: my-data, logs-archive, backups"

You: "Create a new bucket called analytics-2024 with versioning enabled"
Gemini:
  1. Generates infrastructure code
  2. Shows configuration
  3. Creates bucket → "✅ Created S3 bucket analytics-2024 with versioning enabled"

You: "Show me the schema for Lambda functions"
Gemini: Uses get_resource_schema_information() → [Displays schema properties]
```

## Support & Resources

- 📚 [Full Setup Guide](./AWS_CCAPI_MCP_SETUP.md)
- 🔧
  [AWS CCAPI MCP GitHub](https://github.com/awslabs/mcp/blob/main/src/ccapi-mcp-server/README.md)
- 💬 [Report Issues](https://github.com/google-gemini/gemini-cli/issues)
