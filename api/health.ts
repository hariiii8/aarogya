import { sendJson } from './_shared';

export default async function handler(_req: any, res: any) {
  return sendJson(res, 200, { status: 'ok', app: 'AAROGYA Bovine Health', timestamp: new Date().toISOString() });
}
