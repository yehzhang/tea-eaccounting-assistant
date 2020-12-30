import { auth, JWT } from 'google-auth-library';

function getAuthClient(): JWT {
  if (authClient) {
    return authClient;
  }

  const credentials = process.env.GOOGLE_APIS_CREDS;
  if (!credentials) {
    throw new TypeError(
      'Expected environment variable `GOOGLE_APIS_CREDS`. Cannot interact with sheets without it.'
    );
  }

  authClient = auth.fromJSON(JSON.parse(credentials)) as JWT;
  authClient.scopes = [
    'https://www.googleapis.com/auth/drive.file',
    // Necessary to access human created sheets.
    'https://www.googleapis.com/auth/spreadsheets.readonly',
  ];

  return authClient;
}

let authClient: JWT | null = null;

export default getAuthClient;
