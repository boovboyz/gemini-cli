# Using xAI Grok with Gemini CLI

This guide explains how to use xAI's Grok models (including Grok 4 Fast
Reasoning) with the Gemini CLI.

## Prerequisites

1. An xAI API key from [https://console.x.ai/](https://console.x.ai/)
2. Gemini CLI installed

## Setup Instructions

### 1. Get your xAI API Key

1. Visit [https://console.x.ai/](https://console.x.ai/)
2. Sign in or create an account
3. Navigate to the API Keys section
4. Create a new API key and copy it

### 2. Configure Environment Variable

Set your xAI API key as an environment variable:

```bash
export XAI_API_KEY="your-api-key-here"
```

For persistent configuration, add it to your shell profile (`~/.bashrc`,
`~/.zshrc`, etc.):

```bash
echo 'export XAI_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

Or create a `.env` file in your project directory:

```bash
XAI_API_KEY=your-api-key-here
```

### 3. Configure Gemini CLI Settings

You need to configure Gemini CLI to use the xAI authentication type. Create or
update your `.gemini-settings.json` file:

```json
{
  "security": {
    "auth": {
      "selectedType": "xai-api-key"
    }
  }
}
```

## Available Grok Models

The following xAI Grok models are available:

- **grok-2-1212** - The latest Grok 2 model (default)
- **grok-vision-beta** - Grok with vision capabilities
- **grok-4-fast-reasoning** - Grok 4 with fast reasoning capabilities

## Usage Examples

### Using with Command Line Flag

```bash
# Use Grok 4 Fast Reasoning
gemini --model grok-4-fast-reasoning "Explain quantum computing"

# Use Grok 2
gemini --model grok-2-1212 "What is the capital of France?"

# Use Grok Vision (beta)
gemini --model grok-vision-beta "Describe this image"
```

### Using with Settings File

Configure the default model in your `.gemini-settings.json`:

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

Then simply run:

```bash
gemini "Your question here"
```

### Interactive Mode

Start an interactive session with Grok:

```bash
gemini --model grok-4-fast-reasoning
```

## Model Configuration

You can customize model parameters in your `.gemini-settings.json`:

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
  "modelConfigs": {
    "aliases": {
      "grok-4-fast-reasoning": {
        "extends": "base",
        "modelConfig": {
          "model": "grok-4-fast-reasoning",
          "generateContentConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 8192
          }
        }
      }
    }
  }
}
```

## Troubleshooting

### Authentication Errors

If you see an error about missing `XAI_API_KEY`:

1. Verify the environment variable is set: `echo $XAI_API_KEY`
2. Check that your `.gemini-settings.json` has `"selectedType": "xai-api-key"`
3. Restart your terminal or reload your shell configuration

### API Rate Limits

xAI enforces rate limits on API usage. If you encounter rate limit errors:

1. Wait a few moments before retrying
2. Consider reducing the frequency of requests
3. Check your API usage dashboard at
   [https://console.x.ai/](https://console.x.ai/)

### Model Not Found

If you see a "model not found" error:

1. Verify you're using one of the supported model names listed above
2. Check for typos in the model name
3. Ensure you're using the latest version of Gemini CLI

## Features and Limitations

### Supported Features

- ✅ Text generation
- ✅ Streaming responses
- ✅ System instructions
- ✅ Temperature and max token configuration
- ✅ Multi-turn conversations

### Limitations

- ❌ Embedding generation (not supported by xAI)
- ❌ Tool/function calling (not yet implemented)
- ⚠️ Token counting is estimated (xAI doesn't provide exact token counting)

## Example Session

```bash
# Set up environment
export XAI_API_KEY="xai-..."

# Configure settings
cat > .gemini-settings.json << EOF
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
EOF

# Start interactive session
gemini

# Or use directly
gemini --model grok-4-fast-reasoning "Write a Python function to calculate fibonacci numbers"
```

## Additional Resources

- [xAI Documentation](https://docs.x.ai/)
- [xAI API Console](https://console.x.ai/)
- [Gemini CLI Documentation](https://github.com/google-gemini/gemini-cli)

## Support

For issues related to:

- **xAI API**: Contact xAI support at
  [https://console.x.ai/](https://console.x.ai/)
- **Gemini CLI**: Open an issue at
  [https://github.com/google-gemini/gemini-cli/issues](https://github.com/google-gemini/gemini-cli/issues)
