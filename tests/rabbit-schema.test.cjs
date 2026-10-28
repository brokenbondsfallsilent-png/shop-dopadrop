const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const readSchema = name => JSON.parse(fs.readFileSync(path.resolve(__dirname, `../src/backend/${name}.schema.json`), 'utf8'));

test('Rabbit Hole collections deny direct member access', () => {
    for (const name of ['RabbitHuntMembers', 'RabbitHuntGlobal']) {
        const schema = readSchema(name);
        assert.deepEqual(schema.permissions, {
            read: 'siteOwner', insert: 'siteOwner', update: 'siteOwner', remove: 'siteOwner'
        });
    }
});

test('member hunt schema declares durable challenge, daily, forest, and reward state', () => {
    const schema = readSchema('RabbitHuntMembers');

    assert.equal(schema.collectionId, 'RabbitHuntMembers');
    assert.equal(schema.fields.activeChallenge, 'object');
    assert.equal(schema.fields.challengeIssueTimes, 'array');
    assert.equal(schema.fields.dailyAttemptWindows, 'object');
    assert.equal(schema.fields.forestState, 'object');
    assert.equal(schema.fields.rewardStatus, 'text');
    assert.equal(schema.fields.rewardIdempotencyKey, 'text');
    assert.equal(schema.fields.rewardTransactionId, 'text');
    assert.equal(schema.fields.version, 'number');
});

test('global hunt analytics schema cannot store member or reward secrets', () => {
    const schema = readSchema('RabbitHuntGlobal');
    const serialized = JSON.stringify(schema.fields);

    assert.equal(schema.collectionId, 'RabbitHuntGlobal');
    assert.equal(schema.fields.claimantCount, 'number');
    assert.equal(schema.fields.updatedAt, 'datetime');
    assert.doesNotMatch(serialized, /memberId|Challenge|Idempotency|Transaction|rewardChoice/);
});
