# Gemini CLI Integrations

This document lists preconfigured integrations available for Gemini CLI.

## 🤖 AI Model Integrations

### xAI Grok 4 Fast Reasoning

Use Grok 4 Fast Reasoning with full tool calling support as an alternative to
Gemini models.

- **Documentation**: [XAI_GROK_SETUP.md](./XAI_GROK_SETUP.md)
- **Model**: `grok-4-fast-reasoning`
- **Features**:
  - Full tool/function calling support
  - Fast reasoning capabilities
  - 8,192 token output limit
  - Compatible with all Gemini CLI tools

**Quick Setup**:

```bash
export XAI_API_KEY="xai-..."
```

```json
{
  "security": {
    "auth": {
      "selectedType": "xai-api-key"
    }
  },
  "model": {
    "name": "grok-4-fast-reasoning"
  }
}
```

## ☁️ Cloud Provider Integrations

### AWS Cloud Control API (CCAPI) MCP Server

Manage over 1,100 AWS resources through natural language with the official AWS
CCAPI MCP server.

- **Documentation**:
  - Quick Start: [AWS_CCAPI_QUICKSTART.md](./AWS_CCAPI_QUICKSTART.md)
  - Full Guide: [AWS_CCAPI_MCP_SETUP.md](./AWS_CCAPI_MCP_SETUP.md)
- **Setup Script**: `./scripts/setup-aws-ccapi.sh`
- **Configuration Template**: `.gemini-settings.aws-ccapi.json`

**Features**:

- ✅ Create, read, update, delete AWS resources
- ✅ Infrastructure as Code generation
- ✅ CloudFormation schema access
- ✅ Natural language AWS operations
- ⚠️ Preconfigured with security scanning **disabled**

**Supported Resources**: 1,100+ including EC2, S3, Lambda, RDS, DynamoDB, VPC,
IAM, and more

**Quick Setup**:

```bash
# Automated setup
./scripts/setup-aws-ccapi.sh

# Or manual setup
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"
export AWS_REGION="us-east-1"

cp .gemini-settings.aws-ccapi.json .gemini-settings.json
```

**Example Commands**:

```bash
gemini "List all my S3 buckets"
gemini "Create an EC2 t3.micro instance"
gemini "Show schema for AWS::Lambda::Function"
```

**Security Note**: This preconfiguration has Checkov security scanning disabled
for faster operations. Enable it by setting `SECURITY_SCANNING: "enabled"` in
the configuration.

## 🔧 Configuration Options

### Environment Variable Authentication (AWS CCAPI)

The AWS CCAPI integration uses environment variables for authentication:

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

Alternative authentication methods:

- **AWS Profile**: Set `AWS_PROFILE` in configuration
- **AWS SSO**: Configure profile and run `aws sso login`
- **Instance Roles**: Automatic for EC2/ECS/EKS

### Security Scanning Control

By default, the preconfiguration disables Checkov security scanning:

```json
{
  "env": {
    "SECURITY_SCANNING": "disabled"
  }
}
```

To enable security validation:

```json
{
  "env": {
    "SECURITY_SCANNING": "enabled"
  }
}
```

### Read-Only Mode

For safe exploration without modification risk:

```json
{
  "args": ["awslabs.ccapi-mcp-server@latest", "--readonly"]
}
```

## 🚀 Using Multiple Integrations

You can combine integrations in a single configuration:

```json
{
  "security": {
    "auth": {
      "selectedType": "xai-api-key"
    }
  },
  "model": {
    "name": "grok-4-fast-reasoning"
  },
  "mcpServers": {
    "aws-ccapi": {
      "command": "uvx",
      "args": ["awslabs.ccapi-mcp-server@latest"],
      "env": {
        "AWS_REGION": "us-east-1",
        "SECURITY_SCANNING": "disabled"
      },
      "description": "AWS Cloud Control API server",
      "trust": true
    }
  }
}
```

With environment variables:

```bash
export XAI_API_KEY="xai-..."
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

## 📚 Integration Documentation

### xAI Grok

- [Setup Guide](./XAI_GROK_SETUP.md)
- [xAI Documentation](https://docs.x.ai/)
- [xAI Console](https://console.x.ai/)

### AWS CCAPI

- [Quick Start](./AWS_CCAPI_QUICKSTART.md)
- [Full Setup Guide](./AWS_CCAPI_MCP_SETUP.md)
- [AWS CCAPI MCP GitHub](https://github.com/awslabs/mcp/blob/main/src/ccapi-mcp-server/README.md)
- [AWS Cloud Control API Docs](https://docs.aws.amazon.com/cloudcontrolapi/)

## 🤝 Contributing Integrations

Want to add a new integration? See [CONTRIBUTING.md](./CONTRIBUTING.md) for
guidelines on:

- Creating integration documentation
- Adding configuration templates
- Writing setup scripts
- Testing integrations

## 📝 Support

For integration-specific issues:

- **xAI Grok**: [xAI Support](https://console.x.ai/)
- **AWS CCAPI**: [GitHub Issues](https://github.com/awslabs/mcp/issues)
- **Gemini CLI Integration**:
  [GitHub Issues](https://github.com/google-gemini/gemini-cli/issues)
