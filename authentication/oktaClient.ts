import * as dotenv from 'dotenv';
import okta from '@okta/okta-sdk-nodejs';

dotenv.config();

const client = new okta.Client({
  orgUrl: process.env.OKTA_ORG_URL || 'noOktaUrl',
  token: process.env.OKTA_TOKEN || 'noOktaToken'
});

export default client;