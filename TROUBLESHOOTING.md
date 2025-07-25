# Troubleshooting Guide

## Common Issues and Solutions

### 1. "EISDIR: illegal operation on a directory, read" Error

**Problem**: The application is trying to read a directory instead of a file.

**Solution**: 
1. Ensure you have a `config.toml` file in your project root directory
2. Run the setup script to create the config file:
   ```bash
   npm run setup
   ```
3. If the error persists, check that the `config.toml` file is not actually a directory

### 2. "Configuration file not found" Error

**Problem**: The `config.toml` file doesn't exist.

**Solution**:
1. Run the setup script:
   ```bash
   npm run setup
   ```
2. This will create a `config.toml` file from `sample.config.toml`
3. Edit the `config.toml` file to add your API keys

### 3. Docker Volume Mount Issues

**Problem**: Configuration changes aren't reflected in the Docker container.

**Solution**:
1. Ensure the `config.toml` file exists in the same directory as `docker-compose.yaml`
2. Restart the Docker containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### 4. No Models Available

**Problem**: After logging in, no models are shown in the interface.

**Solution**:
1. Check that you have at least one API key configured in `config.toml`
2. Ensure the API keys are valid and have sufficient credits
3. Check the server logs for specific error messages
4. Try restarting the application

### 5. Authentication Issues

**Problem**: Unable to log in or register.

**Solution**:
1. Check that the database is properly initialized
2. Ensure the database file has proper permissions
3. Check server logs for authentication errors

### 6. SearxNG Connection Issues

**Problem**: Web search functionality not working.

**Solution**:
1. Ensure SearxNG is running and accessible
2. Check the `SEARXNG` URL in your `config.toml`
3. Verify network connectivity between containers (if using Docker)

## Getting Help

If you're still experiencing issues:

1. Check the server logs for detailed error messages
2. Ensure you're using the latest version of Perplexica
3. Verify your configuration matches the expected format
4. Check the [GitHub Issues](https://github.com/ItzCrazyKns/Perplexica/issues) for similar problems
5. Join our [Discord community](https://discord.gg/26aArMy8tT) for support 