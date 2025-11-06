# Using xAI Grok 4 Fast Reasoning with Gemini CLI

This guide explains how to use xAI's Grok 4 Fast Reasoning model with full tool
calling support in the Gemini CLI.

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

You need to configure Gemini CLI to use the xAI authentication type. Create the
`.gemini` directory if it doesn't exist, then create or update your
`.gemini/settings.json` file:

```bash
mkdir -p .gemini
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

## Available Model

The following xAI Grok model is available:

- **grok-4-fast-reasoning** - Grok 4 with fast reasoning and full tool calling
  support

## Usage Examples

### Basic Usage

```bash
# Use Grok 4 Fast Reasoning
gemini --model grok-4-fast-reasoning "Explain quantum computing"

# Interactive session
gemini --model grok-4-fast-reasoning
```

### With Settings File

Configure the default model in your `.gemini/settings.json`:

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

## Tool Calling Support

Grok 4 Fast Reasoning supports full tool calling capabilities, allowing the
model to interact with external tools and functions. The Gemini CLI
automatically handles tool declarations and executions.

### How Tool Calling Works

1. **Tool Declaration**: Tools are defined with function declarations including
   name, description, and parameters
2. **Model Decision**: The model decides when to call tools based on the
   conversation
3. **Tool Execution**: The CLI executes the tool and returns results to the
   model
4. **Continuation**: The model uses tool results to generate the final response

### Example with Built-in Tools

```bash
# The model can use built-in tools like file operations, web search, etc.
gemini "Find all JavaScript files in this directory and count them"

# The model will automatically use the appropriate tools:
# 1. List files (glob tool)
# 2. Filter JavaScript files
# 3. Count and report
```

### Tool Calling Features

- ✅ **Function Declarations**: Define custom tools with JSON schema parameters
- ✅ **Automatic Execution**: CLI automatically executes tool calls
- ✅ **Multi-turn Conversations**: Tools can be called multiple times in a
  conversation
- ✅ **Streaming Support**: Tool calls work in both streaming and non-streaming
  modes
- ✅ **Error Handling**: Graceful handling of tool execution errors

## Model Configuration

You can customize model parameters in your `.gemini/settings.json`:

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
        "extends": "chat-base",
        "modelConfig": {
          "model": "grok-4-fast-reasoning",
          "generateContentConfig": {
            "temperature": 0,
            "topP": 1,
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
2. Check that your `.gemini/settings.json` has `"selectedType": "xai-api-key"`
3. Restart your terminal or reload your shell configuration

### API Rate Limits

xAI enforces rate limits on API usage. If you encounter rate limit errors:

1. Wait a few moments before retrying
2. Consider reducing the frequency of requests
3. Check your API usage dashboard at
   [https://console.x.ai/](https://console.x.ai/)

### Tool Execution Errors

If tools fail to execute:

1. Check that the tool parameters are valid
2. Verify you have necessary permissions (for file operations, etc.)
3. Review the error message for specific details

## Features

### Fully Supported

- ✅ Text generation with streaming
- ✅ **Tool/function calling** (full support)
- ✅ System instructions
- ✅ Temperature and max token configuration
- ✅ Multi-turn conversations
- ✅ Function declarations with JSON schema
- ✅ Automatic tool execution
- ✅ Tool result handling

### Limitations

- ❌ Embedding generation (not supported by xAI)
- ⚠️ Token counting is estimated (xAI doesn't provide exact token counting)

## Example Session

```bash
# Set up environment
export XAI_API_KEY="xai-..."

# Configure settings
mkdir -p .gemini
cat > .gemini/settings.json << EOF
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

# Start interactive session with tool calling
gemini

# Example conversation with tools:
# You: "What files are in this directory?"
# (Model uses list_files tool)
# Model: "I found 5 files in the directory: ..."

# You: "Read the package.json file"
# (Model uses read_file tool)
# Model: "Here's the content of package.json: ..."
```

## Performance Tips

1. **Temperature**: Use `temperature: 0` for more deterministic, focused
   responses
2. **Token Limit**: Adjust `maxOutputTokens` based on your needs (default: 8192)
3. **Tool Selection**: The model automatically selects which tools to use based
   on context

## Additional Resources

- [xAI Documentation](https://docs.x.ai/)
- [xAI API Console](https://console.x.ai/)
- [Gemini CLI Documentation](https://github.com/google-gemini/gemini-cli)
- [Tool Calling Guide](https://docs.x.ai/docs/guides/function-calling)

## Support

For issues related to:

- **xAI API or Grok models**: Contact xAI support at
  [https://console.x.ai/](https://console.x.ai/)
- **Gemini CLI integration**: Open an issue at
  [https://github.com/google-gemini/gemini-cli/issues](https://github.com/google-gemini/gemini-cli/issues)

## Changelog

- **v1.1**: Added full tool calling support for Grok 4 Fast Reasoning
- **v1.0**: Initial xAI Grok integration with basic text generation
