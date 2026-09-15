import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = {};
for (const line of envText.split(/\r?\n/)) {
  if (!line.trim() || line.startsWith('#')) continue;
  const eq = line.indexOf('=');
  if (eq >= 0) env[line.slice(0, eq)] = line.slice(eq + 1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
console.log('URL_SET', Boolean(url));
console.log('KEY_SET', Boolean(key));

if (!url || !key) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const email = 'copilot_test_' + Date.now() + '@example.com';
const row = {
  full_name: 'Copilot Test User',
  email,
  phone: '+2348000000000',
  account_number: 'TEST-' + Date.now(),
  password: 'TestPass123!',
  status: 'pending',
  created_at: new Date().toISOString(),
};

try {
  const { data: existing, error: selectError } = await supabase.from('customers').select('email').limit(1);
  if (selectError) {
    console.log('SELECT_ERROR', selectError.message);
    process.exit(1);
  }
  console.log('SELECT_OK', Array.isArray(existing), existing?.length ?? 0);

  const { data, error } = await supabase.from('customers').upsert([row], { onConflict: 'email' }).select();
  if (error) {
    console.log('INSERT_ERROR', error.message);
    process.exit(1);
  }

  console.log('INSERT_OK', JSON.stringify(data));

  const { error: deleteError } = await supabase.from('customers').delete().eq('email', email);
  if (deleteError) {
    console.log('DELETE_ERROR', deleteError.message);
    process.exit(1);
  }

  console.log('DELETE_OK');
} catch (e) {
  console.log('EXCEPTION', e?.message || String(e));
  process.exit(1);
}
