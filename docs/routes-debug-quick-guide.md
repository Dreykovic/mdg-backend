# Routes Debug - Quick Reference Guide

## 🚀 Installation

```bash
npm install --save-dev express-list-endpoints @types/express-list-endpoints tsconfig-paths
```

## 💻 CLI Commands

### Basic Commands
```bash
# Show all routes (table format)
npm run routes

# Show help
npm run routes:help

# Different formats
npm run routes:tree         # Tree view
npm run routes:detailed     # Detailed info
npm run routes:compact      # One-line format
```

### Filter Commands
```bash
# By path pattern
npm run routes:api          # Routes with 'api'
npm run routes:admin        # Routes with 'admin'

# By HTTP method  
npm run routes:get          # GET routes only
npm run routes:post         # POST routes only
```

### Advanced Commands
```bash
# Custom filters
npm run routes -- --method put --path users
npm run routes -- --format tree --path api
npm run routes -- --method post --no-analysis

# Options
npm run routes -- --no-color           # Disable colors
npm run routes -- --no-middlewares     # Hide middlewares
npm run routes -- --group-by method    # Group by HTTP method
```

## 🌐 HTTP Endpoints

### Base Endpoint
```
GET /debug/routes
```

### Response Formats
```bash
# JSON (default)
GET /debug/routes

# Plain text
GET /debug/routes?format=text
```

### Filtering
```bash
# By HTTP method
GET /debug/routes?method=get
GET /debug/routes?method=post

# By path pattern
GET /debug/routes?path=api
GET /debug/routes?path=admin
GET /debug/routes?path=users

# Combined filters
GET /debug/routes?method=post&path=api
GET /debug/routes?method=get&path=users&format=text
```

## 📋 Examples

### CLI Usage Examples
```bash
# Show all API routes in tree format
npm run routes -- --path api --format tree

# Show only POST routes with analysis
npm run routes -- --method post

# Compact view of admin routes without colors
npm run routes -- --path admin --format compact --no-color

# Detailed view without middleware info
npm run routes -- --format detailed --no-middlewares
```

### HTTP Usage Examples
```bash
# Get all routes as JSON
curl http://localhost:3000/debug/routes

# Get API routes as text
curl "http://localhost:3000/debug/routes?path=api&format=text"

# Get POST routes only
curl "http://localhost:3000/debug/routes?method=post"

# Get user-related routes
curl "http://localhost:3000/debug/routes?path=user"
```

## 🔧 Available in Development Only

- HTTP endpoint: `http://localhost:3000/debug/routes`
- CLI commands work in any environment
- Automatically disabled in production for security