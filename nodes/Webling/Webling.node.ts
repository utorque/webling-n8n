import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

export class Webling implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Webling',
		name: 'webling',
		icon: 'file:webling.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Webling API for member management and finance',
		defaults: {
			name: 'Webling',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'weblingApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '=https://{{$credentials.subdomain}}.webling.ch/api/1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Member',
						value: 'member',
					},
					{
						name: 'Member Group',
						value: 'membergroup',
					},
					{
						name: 'Debitor (Invoice)',
						value: 'debitor',
					},
					{
						name: 'Entry (Financial Posting)',
						value: 'entry',
					},
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Period',
						value: 'period',
					},
				],
				default: 'member',
			},

			// MEMBER Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['member'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new member',
						action: 'Create a member',
						routing: {
							request: {
								method: 'POST',
								url: '/member',
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a member',
						action: 'Delete a member',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/member/{{$parameter.memberId}}',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a member by ID',
						action: 'Get a member',
						routing: {
							request: {
								method: 'GET',
								url: '=/member/{{$parameter.memberId}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get multiple members',
						action: 'Get many members',
						routing: {
							request: {
								method: 'GET',
								url: '/member',
								qs: {
									format: 'full',
								},
							},
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
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a member',
						action: 'Update a member',
						routing: {
							request: {
								method: 'PUT',
								url: '=/member/{{$parameter.memberId}}',
							},
						},
					},
				],
				default: 'getAll',
			},

			// Member: Get/Update/Delete ID
			{
				displayName: 'Member ID',
				name: 'memberId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['member'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: 0,
				description: 'ID of the member',
			},

			// Member: Create/Update fields
			{
				displayName: 'Parent Group ID',
				name: 'parentGroupId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['member'],
						operation: ['create'],
					},
				},
				default: 0,
				description: 'ID of the parent member group',
				routing: {
					send: {
						type: 'body',
						property: 'parents',
						value: '=[{{$value}}]',
					},
				},
			},

			{
				displayName: 'Properties',
				name: 'properties',
				type: 'collection',
				placeholder: 'Add Property',
				default: {},
				displayOptions: {
					show: {
						resource: ['member'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'First Name',
						name: 'Vorname',
						type: 'string',
						default: '',
						description: 'First name of the member',
					},
					{
						displayName: 'Last Name',
						name: 'Name',
						type: 'string',
						default: '',
						description: 'Last name of the member',
					},
					{
						displayName: 'Email',
						name: 'E-Mail',
						type: 'string',
						default: '',
						description: 'Email address',
					},
					{
						displayName: 'Phone',
						name: 'Telefon',
						type: 'string',
						default: '',
						description: 'Phone number',
					},
					{
						displayName: 'Street',
						name: 'Strasse',
						type: 'string',
						default: '',
						description: 'Street address',
					},
					{
						displayName: 'Postal Code',
						name: 'PLZ',
						type: 'string',
						default: '',
						description: 'Postal code',
					},
					{
						displayName: 'City',
						name: 'Ort',
						type: 'string',
						default: '',
						description: 'City',
					},
					{
						displayName: 'Birthday',
						name: 'Geburtstag',
						type: 'string',
						default: '',
						description: 'Birthday in YYYY-MM-DD format',
					},
				],
				routing: {
					send: {
						type: 'body',
						property: 'properties',
					},
				},
			},

			// Member: GetAll filters
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['member'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Filter Query',
						name: 'filter',
						type: 'string',
						default: '',
						description: 'Webling query language filter (e.g., `Name` = "Meier")',
						routing: {
							send: {
								type: 'query',
								property: 'filter',
							},
						},
					},
					{
						displayName: 'Order',
						name: 'order',
						type: 'string',
						default: '',
						description: 'Sort order (e.g., `Name` ASC)',
						routing: {
							send: {
								type: 'query',
								property: 'order',
							},
						},
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 100,
						description: 'Max number of results per page',
						routing: {
							send: {
								type: 'query',
								property: 'per_page',
							},
						},
					},
				],
			},

			// MEMBERGROUP Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['membergroup'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new member group',
						action: 'Create a member group',
						routing: {
							request: {
								method: 'POST',
								url: '/membergroup',
							},
						},
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a member group',
						action: 'Delete a member group',
						routing: {
							request: {
								method: 'DELETE',
								url: '=/membergroup/{{$parameter.groupId}}',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a member group',
						action: 'Get a member group',
						routing: {
							request: {
								method: 'GET',
								url: '=/membergroup/{{$parameter.groupId}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get all member groups',
						action: 'Get many member groups',
						routing: {
							request: {
								method: 'GET',
								url: '/membergroup',
								qs: {
									format: 'full',
								},
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a member group',
						action: 'Update a member group',
						routing: {
							request: {
								method: 'PUT',
								url: '=/membergroup/{{$parameter.groupId}}',
							},
						},
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['membergroup'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: 0,
			},

			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['membergroup'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				routing: {
					send: {
						type: 'body',
						property: 'properties.title',
					},
				},
			},

			// DEBITOR Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['debitor'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a debitor/invoice',
						action: 'Get a debitor',
						routing: {
							request: {
								method: 'GET',
								url: '=/debitor/{{$parameter.debitorId}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get multiple debitors',
						action: 'Get many debitors',
						routing: {
							request: {
								method: 'GET',
								url: '/debitor',
								qs: {
									format: 'full',
								},
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a debitor',
						action: 'Update a debitor',
						routing: {
							request: {
								method: 'PUT',
								url: '=/debitor/{{$parameter.debitorId}}',
							},
						},
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Debitor ID',
				name: 'debitorId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['debitor'],
						operation: ['get', 'update'],
					},
				},
				default: 0,
			},

			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['debitor'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Filter Query',
						name: 'filter',
						type: 'string',
						default: '',
						description: 'Filter (e.g., state = "open")',
						routing: {
							send: {
								type: 'query',
								property: 'filter',
							},
						},
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'options',
						default: '',
						description: 'Filter by invoice state',
						options: [
							{
								name: 'All',
								value: '',
							},
							{
								name: 'Open',
								value: 'open',
							},
							{
								name: 'Paid',
								value: 'paid',
							},
						],
						routing: {
							send: {
								type: 'query',
								property: 'filter',
								value: '={{$value ? "state = \\"" + $value + "\\"" : undefined}}',
							},
						},
					},
				],
			},

			// ACCOUNT Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new account',
						action: 'Create an account',
						routing: {
							request: {
								method: 'POST',
								url: '/account',
							},
						},
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an account',
						action: 'Get an account',
						routing: {
							request: {
								method: 'GET',
								url: '=/account/{{$parameter.accountId}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get multiple accounts',
						action: 'Get many accounts',
						routing: {
							request: {
								method: 'GET',
								url: '/account',
								qs: {
									format: 'full',
								},
							},
						},
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an account',
						action: 'Update an account',
						routing: {
							request: {
								method: 'PUT',
								url: '=/account/{{$parameter.accountId}}',
							},
						},
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['account'],
						operation: ['get', 'update'],
					},
				},
				default: 0,
			},

			// ENTRY Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['entry'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get an entry',
						action: 'Get an entry',
						routing: {
							request: {
								method: 'GET',
								url: '=/entry/{{$parameter.entryId}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get multiple entries',
						action: 'Get many entries',
						routing: {
							request: {
								method: 'GET',
								url: '/entry',
								qs: {
									format: 'full',
								},
							},
						},
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Entry ID',
				name: 'entryId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['entry'],
						operation: ['get'],
					},
				},
				default: 0,
			},

			// PERIOD Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['period'],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get a period',
						action: 'Get a period',
						routing: {
							request: {
								method: 'GET',
								url: '=/period/{{$parameter.periodId}}',
							},
						},
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get multiple periods',
						action: 'Get many periods',
						routing: {
							request: {
								method: 'GET',
								url: '/period',
								qs: {
									format: 'full',
								},
							},
						},
					},
				],
				default: 'getAll',
			},

			{
				displayName: 'Period ID',
				name: 'periodId',
				type: 'number',
				required: true,
				displayOptions: {
					show: {
						resource: ['period'],
						operation: ['get'],
					},
				},
				default: 0,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData;

				// Most operations use declarative routing, but handle special cases
				if (resource === 'membergroup' && operation === 'getAll') {
					// Membergroup returns different format - handle roots/objects
					responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'weblingApi',
						{
							method: 'GET',
							url: '/membergroup',
							qs: { format: 'full' },
						},
					);
				} else {
					// Default routing handles most cases
					responseData = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'weblingApi',
						{},
					);
				}

				// Handle array responses
				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map((item) => ({ json: item })));
				} else {
					returnData.push({ json: responseData as IDataObject });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error.message, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
