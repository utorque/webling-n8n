# n8n-nodes-webling

This is an n8n community node for integrating with the [Webling API](https://webling.ch). It provides comprehensive member management, finance, and automation capabilities.

[n8n](https://n8n.io/) is a workflow automation platform that allows you to connect various apps and services.

## Features

### Member Management
- **Member Operations**: Create, read, update, delete members
- **Member Group Operations**: Manage member hierarchies
- **Advanced Filtering**: Use Webling's query language to filter members
- **Custom Fields**: Support for all custom Webling fields

### Finance & Accounting
- **Debitors (Invoices)**: Retrieve and update invoices
- **Accounts**: Manage financial accounts
- **Entries**: Access financial postings and transactions
- **Periods**: Work with accounting periods

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in n8n
2. Select **Install**
3. Enter `n8n-nodes-webling` in **Enter npm package name**
4. Agree to the risks and install

### Manual Installation

To install manually (for development or custom deployment):

```bash
# Navigate to your n8n installation
cd ~/.n8n/custom

# Clone or install the package
npm install n8n-nodes-webling
```

## Credentials

To use this node, you need Webling API credentials:

1. Log in to your Webling instance
2. Go to **Administration > API**
3. Create a new API key
4. In n8n, create a new credential:
   - **Subdomain**: Your Webling subdomain (e.g., "yourcompany" from yourcompany.webling.ch)
   - **API Key**: The API key you generated

## Operations

### Member

- **Create**: Create a new member with custom properties
- **Get**: Retrieve a single member by ID
- **Get Many**: Retrieve multiple members with filtering
- **Update**: Update member properties
- **Delete**: Delete a member

Example filter queries:
```
`Name` = "Meier"
AGE(`Geburtstag`) >= 18
`E-Mail` IS EMPTY
$parents.$id = 550
```

### Member Group

- **Create**: Create a new member group
- **Get**: Retrieve a group by ID
- **Get Many**: Retrieve all groups
- **Update**: Update group properties
- **Delete**: Delete a group

### Debitor (Invoice)

- **Get**: Retrieve a single invoice
- **Get Many**: Retrieve multiple invoices
- **Update**: Update invoice properties

Filter examples:
```
state = "open"
$links.member.$id = 504
```

### Account

- **Create**: Create a new account
- **Get**: Retrieve an account
- **Get Many**: Retrieve multiple accounts
- **Update**: Update account properties

### Entry (Financial Posting)

- **Get**: Retrieve a single entry
- **Get Many**: Retrieve multiple entries

### Period

- **Get**: Retrieve a period
- **Get Many**: Retrieve multiple periods

## Usage Examples

### Example 1: Get All Active Members

```
Resource: Member
Operation: Get Many
Filters:
  - Filter Query: `Status` = "Aktiv"
  - Order: `Name` ASC
```

### Example 2: Create a New Member

```
Resource: Member
Operation: Create
Parent Group ID: 550
Properties:
  - First Name: John
  - Last Name: Doe
  - Email: john.doe@example.com
  - Phone: +41 44 123 4567
```

### Example 3: Get Open Invoices

```
Resource: Debitor
Operation: Get Many
Filters:
  - State: Open
```

### Example 4: Filter Members by Age

```
Resource: Member
Operation: Get Many
Filters:
  - Filter Query: AGE(`Geburtstag`) >= 18 AND AGE(`Geburtstag`) < 65
  - Order: `Geburtstag` DESC
```

## API Documentation

For detailed Webling API documentation, see:
- [Webling API Documentation](https://demo.webling.ch/api/1)
- [Query Language Reference](https://demo.webling.ch/api/1#query)

## Development

### Prerequisites

- Node.js 18+
- n8n installed locally

### Setup

```bash
# Clone the repository
git clone https://github.com/utorque/webling-n8n.git
cd n8n-nodes-webling

# Install dependencies
npm install

# Build the node
npm run build

# Watch for changes during development
npm run dev
```

### Testing

```bash
# Lint the code
npm run lint

# Auto-fix lint issues
npm run lintfix

# Format code
npm run format
```

## Limitations

- Rate limit: 500 requests/minute (Webling API limitation)
- Complex nested object creation (like debitors with entries) may require multiple nodes
- Some Webling-specific field names are in German (customizable per instance)

## Compatibility

- n8n version: 1.0.0+
- Node.js: 18+

## Resources

- [n8n community forum](https://community.n8n.io/)
- [Webling website](https://webling.ch)

## License

[MIT](LICENSE.md)

## Issues & Contributions

Found a bug or have a feature request? Please open an issue on GitHub.

Contributions are welcome! Please read the contributing guidelines first.
