# AWS Cloud Control API (CCAPI) MCP Server Configuration

This configuration provides pre-configured access to the AWS Cloud Control API
MCP server for Gemini CLI, enabling natural language management of over 1,100
AWS resources.

## Prerequisites

Before using this configuration, ensure you have:

1. **AWS Credentials**: Valid AWS access credentials
2. **Python/uvx**: The server uses `uvx` to run the Python package
3. **IAM Permissions**: Appropriate permissions for resources you want to manage

## Installation

The AWS CCAPI MCP server will be automatically installed when you run Gemini CLI
with this configuration (via `uvx`).

## Configuration

Add this to your `.gemini-settings.json` file:

```json
{
  "mcpServers": {
    "aws-ccapi": {
      "command": "uvx",
      "args": ["awslabs.ccapi-mcp-server@latest"],
      "env": {
        "AWS_REGION": "us-east-1",
        "SECURITY_SCANNING": "disabled"
      },
      "description": "AWS Cloud Control API server for managing AWS resources",
      "trust": true
    }
  }
}
```

### Environment Variables for Authentication

This configuration uses **Environment Variables** authentication. Set these
before running Gemini CLI:

```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_REGION="us-east-1"  # or your preferred region
```

For persistent configuration, add to your shell profile (`~/.bashrc`,
`~/.zshrc`, etc.):

```bash
echo 'export AWS_ACCESS_KEY_ID="your-access-key-id"' >> ~/.bashrc
echo 'export AWS_SECRET_ACCESS_KEY="your-secret-access-key"' >> ~/.bashrc
echo 'export AWS_REGION="us-east-1"' >> ~/.bashrc
source ~/.bashrc
```

### Alternative: AWS Profile Authentication

If you prefer to use AWS profiles instead of environment variables:

```json
{
  "mcpServers": {
    "aws-ccapi": {
      "command": "uvx",
      "args": ["awslabs.ccapi-mcp-server@latest"],
      "env": {
        "AWS_PROFILE": "your-profile-name",
        "AWS_REGION": "us-east-1",
        "SECURITY_SCANNING": "disabled"
      },
      "description": "AWS Cloud Control API server for managing AWS resources",
      "trust": true
    }
  }
}
```

Then configure your AWS profile:

```bash
aws configure --profile your-profile-name
```

## Security Settings

### Checkov Security Scanning

**This configuration has Checkov security scanning DISABLED** via
`"SECURITY_SCANNING": "disabled"`.

This means:

- ❌ No automatic security policy checks before resource creation
- ❌ No validation for overly permissive IAM policies
- ❌ No checks for public access configurations
- ⚠️ **Use with caution** - you are responsible for ensuring secure
  configurations

To **enable** security scanning, change the configuration:

```json
{
  "env": {
    "AWS_REGION": "us-east-1",
    "SECURITY_SCANNING": "enabled" // or omit this line (enabled by default)
  }
}
```

### Trust Setting

The configuration includes `"trust": true` which marks this MCP server as
trusted. This means:

- The server can execute operations without additional confirmation prompts
- Combined with disabled security scanning, this provides maximum automation
- **Recommendation**: Only use with well-understood AWS permissions

## Available Capabilities

Once configured, the model can:

### Resource Operations

- **Create**: `create_resource(type_name, properties, ...)`
- **Read**: `get_resource(type_name, identifier, ...)`
- **Update**: `update_resource(type_name, identifier, properties, ...)`
- **Delete**: `delete_resource(type_name, identifier, ...)`
- **List**: `list_resources(type_name, ...)`

### Infrastructure as Code

- **Generate Templates**:
  `generate_infrastructure_code(resource_type, resource_name, properties)`
- **Explain Configuration**: `explain(resource_type, properties)` - Shows what
  will be created
- **Get Schemas**: `get_resource_schema_information(type_name)`

### AWS Environment

- **Check Credentials**: `check_environment_variables()`
- **Session Info**: `get_aws_session_info()`
- **Account Info**: `get_aws_account_info()`

### Supported Resource Types

Over 1,100 AWS resource types including:

- EC2: Instances, Security Groups, VPCs, Subnets
- S3: Buckets
- RDS: DB Instances, DB Clusters
- Lambda: Functions, Event Source Mappings
- IAM: Roles, Policies, Users
- DynamoDB: Tables
- And many more...

Format: `AWS::ServiceName::ResourceType` (e.g., `AWS::EC2::Instance`)

## Usage Examples

### Example 1: Create an S3 Bucket

```bash
gemini "Create an S3 bucket called my-data-bucket in us-west-2 with versioning enabled"
```

The model will:

1. Generate the infrastructure code
2. Show you what will be created
3. Create the S3 bucket (without security scan if disabled)

### Example 2: List EC2 Instances

```bash
gemini "List all my EC2 instances"
```

### Example 3: Get Resource Schema

```bash
gemini "Show me the schema for AWS::Lambda::Function"
```

### Example 4: Generate CloudFormation Template

```bash
gemini "Generate a CloudFormation template for an EC2 instance with type t3.micro"
```

## Complete Configuration Example

Here's a complete `.gemini-settings.json` with both xAI Grok and AWS CCAPI MCP:

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
      "description": "AWS Cloud Control API server for managing AWS resources",
      "trust": true
    }
  }
}
```

With environment variables set:

```bash
export XAI_API_KEY="xai-..."
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"
```

## Read-Only Mode

For query-only access without modification capabilities:

```json
{
  "mcpServers": {
    "aws-ccapi": {
      "command": "uvx",
      "args": ["awslabs.ccapi-mcp-server@latest", "--readonly"],
      "env": {
        "AWS_REGION": "us-east-1"
      },
      "description": "AWS Cloud Control API server (read-only)",
      "trust": true
    }
  }
}
```

## Troubleshooting

### Authentication Errors

If you see authentication errors:

1. Verify environment variables: `echo $AWS_ACCESS_KEY_ID`
2. Check credentials have not expired
3. Run `aws sts get-caller-identity` to verify AWS credentials work

### Permission Errors

If operations fail with permission errors:

1. Check the IAM user/role has necessary permissions
2. Review the specific error message for required permissions
3. Add permissions via IAM console or CLI

### uvx Not Found

If `uvx` command is not found:

1. Install uv: `pip install uv` or
   `curl -LsSf https://astral.sh/uv/install.sh | sh`
2. Ensure it's in your PATH
3. Alternative: Use `npx` instead if you have Node.js

### Region Issues

If resources are in different regions:

1. Change `AWS_REGION` environment variable
2. Or specify region in commands: "in us-west-2"
3. Or use different MCP server configs for different regions

## Security Best Practices

Even with security scanning disabled, follow these practices:

1. **Least Privilege**: Use IAM credentials with minimal necessary permissions
2. **Review Generated Code**: Always review infrastructure code before creation
3. **Use Read-Only Mode**: For exploration without risk of changes
4. **Enable Security Scanning**: Re-enable when moving to production
5. **Audit Trail**: Review CloudTrail logs for all resource changes
6. **Tag Resources**: The server auto-tags resources with
   `MANAGED_BY: CCAPI-MCP-SERVER`

## Additional Resources

- [AWS CCAPI MCP Server GitHub](https://github.com/awslabs/mcp/blob/main/src/ccapi-mcp-server/README.md)
- [AWS Cloud Control API Documentation](https://docs.aws.amazon.com/cloudcontrolapi/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Gemini CLI MCP Documentation](https://docs.claude.com/docs/gemini-cli/mcp-server)

## Support

For issues with:

- **AWS CCAPI MCP Server**:
  [Open an issue on GitHub](https://github.com/awslabs/mcp/issues)
- **Gemini CLI Integration**:
  [Open an issue](https://github.com/google-gemini/gemini-cli/issues)
- **AWS Services**: AWS Support Console
