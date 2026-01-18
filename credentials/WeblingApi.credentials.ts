import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WeblingApi implements ICredentialType {
	name = 'weblingApi';
	displayName = 'Webling API';
	documentationUrl = 'https://demo.webling.ch/api/1';
	properties: INodeProperties[] = [
		{
			displayName: 'Subdomain',
			name: 'subdomain',
			type: 'string',
			default: '',
			placeholder: 'yourcompany',
			description: 'Your Webling subdomain (from yourcompany.webling.ch)',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The API key from Administration > API in Webling',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'apikey': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '=https://{{$credentials.subdomain}}.webling.ch/api/1',
			url: '/config',
		},
	};
}
