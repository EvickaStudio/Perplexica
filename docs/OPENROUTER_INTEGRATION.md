# OpenRouter Integration

This document explains how to use the OpenRouter integration in Perplexica, which provides access to multiple AI model providers through a single API.

## What is OpenRouter?

OpenRouter is a unified API that provides access to multiple AI model providers including:

- OpenAI (GPT-4, GPT-3.5, etc.)
- Anthropic (Claude)
- Google (Gemini)
- Groq
- And many more...

## Features

### 🚀 Dynamic Model Loading

- Automatically fetches available models from OpenRouter's API
- Shows real-time pricing information for each model
- Displays model capabilities and context lengths

### 💳 Balance Management

- Real-time USD balance tracking
- Visual progress bars for balance consumption
- Low balance warnings
- Free tier support

### 🔍 Model Discovery

- Browse all available models across providers
- Search and filter models by capabilities
- View detailed model information including pricing

### 🎯 Provider Routing

- Automatic fallback to alternative providers
- Cost optimization by selecting the most affordable option
- Provider-specific parameter support

## Setup

### 1. Get an OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key

### 2. Configure Perplexica

1. Open your `config.toml` file
2. Add your OpenRouter API key:

```toml
[MODELS.OPENROUTER]
API_KEY = "your-openrouter-api-key-here"
```

3. Restart Perplexica

### 3. Select OpenRouter Models

1. Go to Settings in Perplexica
2. Under "Model Settings", select "OpenRouter" as your chat model provider
3. Choose from the available models (pricing will be displayed)
4. Optionally select an embedding model from OpenRouter as well

## Usage

### Model Selection

When you select OpenRouter as your provider, you'll see models with pricing information displayed in the format:

```
Model Name ($X.XX/1M tokens / $Y.YY/1M tokens)
```

This shows the cost for:

- Input tokens (prompt) per million tokens
- Output tokens (completion) per million tokens

### Account Monitoring

The OpenRouter widget in Settings shows:

- Current USD usage
- Balance limit (if applicable)
- Remaining balance
- Usage percentage
- Account status (Free Tier/Paid)

### Features

#### Streaming Support

OpenRouter supports streaming responses for all models, providing real-time output.

#### Tool Calling

Many models support function/tool calling for enhanced capabilities.

#### Image Support

Models that support image input (like GPT-4 Vision) are automatically available.

#### JSON Output

Models supporting structured JSON output are available for programmatic use.

## API Endpoints

### Models List

```
GET /api/v1/models
```

Returns all available models with pricing and capabilities.

### Account Information

```
GET /api/openrouter
```

Returns account details including credits and usage.

### Chat Completion

```
POST /api/v1/chat/completions
```

Standard chat completion endpoint compatible with OpenAI's format.

## Model Categories

### Chat Models

- **GPT Models**: GPT-4, GPT-3.5, GPT-4 Turbo, etc.
- **Claude Models**: Claude-3 Opus, Claude-3 Sonnet, Claude-3 Haiku
- **Gemini Models**: Gemini Pro, Gemini Flash
- **Specialized Models**: Code generation, creative writing, analysis

### Embedding Models

- **Text Embeddings**: For semantic search and similarity
- **Multimodal Embeddings**: For text and image understanding

## Pricing

### Free Tier

- Limited daily requests
- Access to basic models
- No credit card required

### Paid Plans

- Pay-per-use pricing
- Access to premium models
- Higher rate limits
- Priority support

### Cost Optimization

OpenRouter automatically selects the most cost-effective provider for your chosen model, helping you save money while maintaining quality.

## Advanced Features

### Provider Preferences

You can specify preferred providers or exclude certain providers:

```typescript
// In your request
{
  "model": "openai/gpt-4",
  "provider": {
    "prefer": ["openai", "anthropic"],
    "avoid": ["some-provider"]
  }
}
```

### Model Routing

OpenRouter can automatically route to alternative models if your preferred model is unavailable:

```typescript
{
  "model": "openai/gpt-4",
  "route": "fallback"
}
```

### Transforms

Apply pre-processing transforms to your prompts:

```typescript
{
  "model": "openai/gpt-4",
  "transforms": ["trim", "normalize"]
}
```

## Troubleshooting

### Common Issues

#### "OpenRouter API key not configured"

- Ensure your API key is correctly set in `config.toml`
- Restart Perplexica after configuration changes
- Check that the API key is valid on OpenRouter's website

#### "No models available"

- Verify your API key has sufficient balance
- Check OpenRouter's status page for any outages
- Ensure your account is properly activated

#### "Rate limited"

- OpenRouter has rate limits based on your account type
- Free tier has lower limits than paid accounts
- Consider upgrading for higher limits

#### "Model not found"

- Some models may be temporarily unavailable
- Try selecting a different model
- Check OpenRouter's model status page

### Getting Help

1. **OpenRouter Documentation**: [docs.openrouter.ai](https://docs.openrouter.ai)
2. **OpenRouter Status**: [status.openrouter.ai](https://status.openrouter.ai)
3. **Community Support**: [Discord](https://discord.gg/openrouter)

## Best Practices

### Model Selection

- Start with GPT-3.5 for general tasks (cost-effective)
- Use GPT-4 for complex reasoning
- Choose specialized models for specific domains (code, creative writing, etc.)

### Cost Management

- Monitor your USD balance regularly
- Set up billing alerts on OpenRouter
- Use the balance tracking widget in Settings

### Performance

- Use streaming for better user experience
- Implement proper error handling
- Cache responses when appropriate

## Migration from Other Providers

If you're currently using other providers directly, migrating to OpenRouter is straightforward:

1. **Replace API keys**: Use your OpenRouter key instead of individual provider keys
2. **Update model names**: Use OpenRouter's model format (e.g., `openai/gpt-4`)
3. **Test functionality**: Verify all features work as expected
4. **Monitor costs**: Compare pricing with your previous setup

## Security

- API keys are stored securely in your local configuration
- OpenRouter supports OAuth for enhanced security
- All requests are encrypted in transit
- No data is stored by OpenRouter beyond what's necessary for billing

## Updates

The OpenRouter integration is actively maintained and updated to support:

- New models as they become available
- Latest API features
- Performance improvements
- Security enhancements

Check the Perplexica changelog for updates to the OpenRouter integration.
