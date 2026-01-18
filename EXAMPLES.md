# Example Workflows

## Basic Member Management

### Workflow 1: Sync New Members from Google Sheets

**Trigger**: Manual or Schedule  
**Purpose**: Import new members from a Google Sheet into Webling

```
1. Google Sheets → Read Sheet
   - Spreadsheet: "Member Import"
   - Sheet: "New Members"

2. Webling → Create Member
   - Resource: Member
   - Operation: Create
   - Properties:
     - Vorname: {{$json.firstName}}
     - Name: {{$json.lastName}}
     - E-Mail: {{$json.email}}
     - Telefon: {{$json.phone}}
   - Parent Group ID: 550

3. Google Sheets → Update Row
   - Mark as imported
```

### Workflow 2: Export Active Members to CSV

**Trigger**: Schedule (daily)  
**Purpose**: Export all active members for reporting

```
1. Webling → Get Many Members
   - Resource: Member
   - Operation: Get Many
   - Filters:
     - Filter: `Status` = "Aktiv"
     - Order: `Name` ASC

2. Code Node → Transform Data
   - Extract relevant fields
   - Format for CSV

3. Write to File → Save CSV
   - File path: /exports/members_{{$now.format('YYYY-MM-DD')}}.csv
```

## Finance & Invoicing

### Workflow 3: Monthly Membership Invoice Generation

**Trigger**: Schedule (1st of month)  
**Purpose**: Create membership invoices for all active members

```
1. Webling → Get Many Members
   - Filter: `Status` = "Aktiv" AND `Membership Type` = "Full"

2. Webling → Get Period
   - Get current accounting period

3. Loop → For Each Member
   
   4. Webling → Create Debitor
      - Resource: Debitor
      - Operation: Create
      - Invoice Title: Membership Fee {{$now.format('MMMM YYYY')}}
      - Linked Member ID: {{$item.json.id}}
      - Period ID: {{$node["Get Period"].json.id}}

   5. Send Email → Confirmation
      - To: {{$item.json.properties['E-Mail']}}
      - Subject: Invoice for {{$now.format('MMMM')}}
```

### Workflow 4: Payment Reconciliation

**Trigger**: Manual  
**Purpose**: Match bank transactions with open invoices

```
1. Read Bank CSV → Import Transactions

2. Webling → Get Many Debitors
   - Filter: state = "open"

3. Code Node → Match Payments
   - Match by reference number or amount
   - Create matching array

4. Loop → For Each Match
   
   5. Webling → Update Debitor
      - Mark as paid
   
   6. Slack → Notify Team
      - Send payment confirmation
```

## Automation & Integration

### Workflow 5: Birthday Notifications

**Trigger**: Schedule (daily 8am)  
**Purpose**: Send birthday greetings

```
1. Webling → Get Many Members
   - Filter: MONTH(`Geburtstag`) = {{$now.month()}} AND DAY(`Geburtstag`) = {{$now.date()}}

2. If → Has Birthdays Today
   
   3a. Loop → For Each Birthday
      
      4. Send Email → Birthday Greeting
         - To: {{$item.json.properties['E-Mail']}}
         - Template: Birthday email

   3b. Skip if no birthdays
```

### Workflow 6: New Member Onboarding

**Trigger**: Webhook  
**Purpose**: Automated onboarding when new member joins

```
1. Webhook → Receive Member Data
   - From signup form

2. Webling → Create Member
   - Map form fields to Webling properties

3. Webling → Create Debitor
   - Generate first invoice (registration fee)

4. Parallel Branches:
   
   5a. Send Welcome Email
      - Welcome message
      - Login credentials
      - Important info
   
   5b. Slack Notification
      - Notify admin team
      - New member joined
   
   5c. Add to Mailchimp
      - Subscribe to newsletter
```

## Reporting & Analytics

### Workflow 7: Monthly Financial Report

**Trigger**: Schedule (1st of month)  
**Purpose**: Generate comprehensive financial report

```
1. Webling → Get Period
   - Get previous month's period

2. Webling → Get Many Accounts
   - Filter by period

3. Webling → Get Many Entries
   - Get all entries for period

4. Code Node → Calculate Totals
   - Revenue by category
   - Expenses by category
   - Net income/loss
   - Account balances

5. Google Sheets → Write Report
   - Create formatted report

6. Send Email → Distribute Report
   - To: finance@organization.com
   - Attach: Monthly report
```

### Workflow 8: Member Activity Dashboard

**Trigger**: Schedule (hourly)  
**Purpose**: Update real-time member statistics

```
1. Webling → Get All Member Groups
   - Get group hierarchy

2. Loop → For Each Group
   
   3. Webling → Get Many Members
      - Filter: $parents.$id = {{$item.json.id}}
   
   4. Code Node → Calculate Stats
      - Total members
      - Active members
      - New this month
      - Age distribution

5. Airtable → Update Dashboard
   - Push statistics to dashboard database
```

## Data Quality & Maintenance

### Workflow 9: Find Duplicate Members

**Trigger**: Manual  
**Purpose**: Identify potential duplicate member records

```
1. Webling → Get All Members

2. Code Node → Find Duplicates
   - Group by email or name
   - Flag potential duplicates

3. If → Duplicates Found
   
   4. Google Sheets → Write Report
      - List potential duplicates
      - Side-by-side comparison
   
   5. Send Email → Notify Admin
      - Request manual review
```

### Workflow 10: Data Validation

**Trigger**: Schedule (weekly)  
**Purpose**: Check data quality and completeness

```
1. Webling → Get All Members

2. Code Node → Validate Data
   - Check for:
     - Missing emails
     - Invalid phone numbers
     - Incomplete addresses
     - Members without groups

3. If → Issues Found
   
   4. Create Issues List
   
   5. Send Email → Data Quality Report
      - List all issues
      - Assign to data team
```

## Advanced Patterns

### Workflow 11: Member Lifecycle Management

**Trigger**: Schedule (daily)  
**Purpose**: Manage member status based on rules

```
1. Webling → Get Members
   - Filter: All members

2. Code Node → Evaluate Rules
   - Check payment status
   - Check last activity
   - Check membership expiry

3. Switch → Based on Status
   
   4a. Inactive → Send Reminder
   4b. Expired → Move to Alumni Group
   4c. Delinquent → Send Payment Reminder
   4d. Active → No action
```

### Workflow 12: Multi-Language Communication

**Trigger**: Various  
**Purpose**: Send communications in member's preferred language

```
1. Webling → Get Member

2. Code Node → Determine Language
   - From member properties

3. Switch → Language
   
   4a. German → Send DE Email
   4b. French → Send FR Email
   4c. Italian → Send IT Email
   4d. English → Send EN Email
```

## Integration Examples

### Workflow 13: Sync with External CRM

**Trigger**: Schedule (every 15 min)  
**Purpose**: Keep Webling and external CRM in sync

```
1. Get Last Sync Timestamp

2. Webling → Get Changes Since Last Sync
   - Use replicate endpoint

3. Loop → For Each Change
   
   4. External CRM → Update Record
   
   5. Set Variable → Update Sync Timestamp
```

### Workflow 14: Event Registration Integration

**Trigger**: Eventbrite Webhook  
**Purpose**: Register event participants in Webling

```
1. Webhook → Receive Registration

2. Webling → Search Member
   - By email

3. If → Member Exists
   
   4a. Update Member
      - Add event attendance
   
   4b. Create New Member
      - Add to events group
      - Mark as event participant

5. Webling → Create Invoice
   - For event fee
```

## Testing & Debugging Tips

1. **Use Manual Trigger**: Test workflows step-by-step
2. **Add Set Nodes**: Log intermediate values
3. **Enable Errors**: Use Error Trigger for debugging
4. **Check Webling Logs**: Review API activity in Webling admin
5. **Use Test Data**: Create test members/invoices before automation
