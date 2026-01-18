# Development Guide

## Architecture

This node uses the **declarative style** for n8n node development, which is the recommended approach for HTTP API integrations.

### File Structure

```
n8n-nodes-webling/
├── credentials/
│   └── WeblingApi.credentials.ts     # API authentication
├── nodes/
│   └── Webling/
│       ├── Webling.node.ts            # Main node logic
│       └── webling.svg                # Node icon
├── package.json                        # Node metadata
├── tsconfig.json                       # TypeScript config
├── gulpfile.js                         # Icon processing
└── README.md
```

## Key Concepts

### 1. Declarative Routing

The node uses `routing` properties to define HTTP requests declaratively:

```typescript
routing: {
  request: {
    method: 'GET',
    url: '=/member/{{$parameter.memberId}}',
  },
}
```

### 2. Resource-Operation Pattern

Operations are organized by resource (member, account, etc.) with CRUD operations.

### 3. Conditional Display

UI elements show/hide based on selected resource and operation:

```typescript
displayOptions: {
  show: {
    resource: ['member'],
    operation: ['create'],
  },
}
```

## Adding New Resources

To add a new resource (e.g., `document`):

### 1. Add to Resource Dropdown

```typescript
{
  displayName: 'Resource',
  name: 'resource',
  type: 'options',
  options: [
    // ... existing resources
    {
      name: 'Document',
      value: 'document',
    },
  ],
}
```

### 2. Add Operations

```typescript
{
  displayName: 'Operation',
  name: 'operation',
  type: 'options',
  displayOptions: {
    show: {
      resource: ['document'],
    },
  },
  options: [
    {
      name: 'Get',
      value: 'get',
      action: 'Get a document',
      routing: {
        request: {
          method: 'GET',
          url: '=/document/{{$parameter.documentId}}',
        },
      },
    },
    // Add more operations
  ],
}
```

### 3. Add Parameters

```typescript
{
  displayName: 'Document ID',
  name: 'documentId',
  type: 'number',
  required: true,
  displayOptions: {
    show: {
      resource: ['document'],
      operation: ['get'],
    },
  },
  default: 0,
}
```

## Adding Complex Operations

For operations requiring custom logic (not just simple HTTP requests):

### 1. Override in execute() method

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  // ... existing code
  
  if (resource === 'member' && operation === 'customOperation') {
    // Step 1: Make first request
    const step1 = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'weblingApi',
      {
        method: 'GET',
        url: '/member',
      },
    );
    
    // Step 2: Process data
    const processed = step1.map(/* ... */);
    
    // Step 3: Make second request
    const step2 = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'weblingApi',
      {
        method: 'POST',
        url: '/custom',
        body: processed,
      },
    );
    
    responseData = step2;
  }
  
  // ... rest of code
}
```

## Webling Query Language Support

The filter parameter accepts Webling query language:

```typescript
{
  displayName: 'Filter Query',
  name: 'filter',
  type: 'string',
  default: '',
  description: 'Webling query language (e.g., `Name` = "Meier")',
  routing: {
    send: {
      type: 'query',
      property: 'filter',
    },
  },
}
```

### Common Filters

- **Exact match**: `` `Name` = "Meier" ``
- **Age calculation**: `` AGE(`Geburtstag`) >= 18 ``
- **Empty check**: `` `E-Mail` IS EMPTY ``
- **Parent filter**: `` $parents.$id = 550 ``
- **Linked objects**: `` $links.debitor.state = "open" ``

## Error Handling

The node implements robust error handling:

```typescript
try {
  // Operation logic
} catch (error) {
  if (this.continueOnFail()) {
    // Continue processing other items
    returnData.push({
      json: { error: error.message },
      pairedItem: { item: i },
    });
    continue;
  }
  // Throw error and stop workflow
  throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
}
```

## Response Handling

### Array Responses

Webling returns arrays for "Get Many" operations. The node handles this:

```typescript
if (Array.isArray(responseData)) {
  returnData.push(...responseData.map((item) => ({ json: item })));
} else {
  returnData.push({ json: responseData as IDataObject });
}
```

### Special Formats

Some endpoints (like `/membergroup`) return `{objects: [], roots: []}`. Use postReceive to extract:

```typescript
routing: {
  output: {
    postReceive: [
      {
        type: 'rootProperty',
        properties: {
          property: 'objects',
        },
      },
    ],
  },
}
```

## Testing

### Local Testing

1. Build the node:
```bash
npm run build
```

2. Link to n8n:
```bash
cd ~/.n8n/custom
npm link /path/to/n8n-nodes-webling
```

3. Restart n8n:
```bash
n8n start
```

### With Docker

Add to docker-compose.yml:

```yaml
volumes:
  - ./n8n-nodes-webling/dist:/home/node/.n8n/custom/node_modules/n8n-nodes-webling
```

## Best Practices

### 1. Use Declarative Routing When Possible

Prefer routing properties over custom execute logic.

**Good:**
```typescript
routing: {
  request: {
    method: 'GET',
    url: '/member',
  },
}
```

**Avoid (unless necessary):**
```typescript
// Custom HTTP call in execute()
```

### 2. Maintain Item Linking

Always use `pairedItem` for error handling:

```typescript
returnData.push({
  json: { error: error.message },
  pairedItem: { item: i },
});
```

### 3. Validate Input

Use `required: true` and provide good defaults:

```typescript
{
  displayName: 'Member ID',
  name: 'memberId',
  type: 'number',
  required: true,
  default: 0,
  description: 'ID of the member',
}
```

### 4. Clear Error Messages

Provide context in errors:

```typescript
throw new NodeOperationError(
  this.getNode(),
  `Member with ID ${memberId} not found`,
  { itemIndex: i }
);
```

## Rate Limiting

Webling API has a 500 requests/minute limit. For batch operations:

1. Use `format=full` to get all data in one request
2. Implement delays for large batches
3. Use Webling's `/replicate` endpoint for incremental updates

## Publishing

### 1. Update Version

```bash
npm version patch  # or minor, major
```

### 2. Build

```bash
npm run build
```

### 3. Publish to npm

```bash
npm publish
```

### 4. Submit to n8n

Follow [n8n's verification process](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/).

## Resources

- [n8n Node Development Docs](https://docs.n8n.io/integrations/creating-nodes/)
- [Webling API Documentation](https://demo.webling.ch/api/1)
- [n8n Community Forum](https://community.n8n.io/)
