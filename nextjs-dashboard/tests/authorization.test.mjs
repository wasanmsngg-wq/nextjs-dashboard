import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { canManageHospitals } from '../app/lib/authorization-policy.ts';

test('hospital management policy allows only admins', () => {
  assert.equal(canManageHospitals(null), false);
  assert.equal(canManageHospitals({ user: {} }), false);
  assert.equal(canManageHospitals({ user: { role: 'viewer' } }), false);
  assert.equal(canManageHospitals({ user: { role: 'admin' } }), true);
});

test('every hospital mutation checks authorization before database access', () => {
  const source = readFileSync(
    new URL('../app/lib/support/actions.ts', import.meta.url),
    'utf8',
  );

  for (const [name, nextName] of [
    ['createHospital', 'updateHospital'],
    ['updateHospital', 'deleteHospital'],
    ['deleteHospital', undefined],
  ]) {
    const start = source.indexOf(`export async function ${name}`);
    const end = nextName
      ? source.indexOf(`export async function ${nextName}`)
      : source.length;
    const implementation = source.slice(start, end);
    const authorizationIndex = implementation.indexOf('await isHospitalAdmin()');
    const databaseIndex = implementation.indexOf('sql`');

    assert.notEqual(start, -1, `${name} must exist`);
    assert.notEqual(authorizationIndex, -1, `${name} must authorize`);
    assert.notEqual(databaseIndex, -1, `${name} must contain its database operation`);
    assert.ok(
      authorizationIndex < databaseIndex,
      `${name} must authorize before database access`,
    );
  }
});
