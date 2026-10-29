const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('Daily renders all three released choices through the shared question bridge', () => {
    const source = read('src/pages/Rabbit Hole Daily.i6ju2.js');

    assert.doesNotMatch(source, /textarea_comp-mvl0zj49|comp-mvl0xvaa/);
    assert.match(source, /bindRabbitQuestionView/);
    assert.match(source, /#rabbitQuestionView|bindRabbitQuestionView\(\$w/);
    assert.match(source, /entry\.choices\.map/);
    assert.match(source, /id:\s*`choice-\$\{index \+ 1\}`/);
    assert.match(source, /label:\s*choice/);
    assert.match(source, /action:\s*'answer'/);
    assert.match(source, /choiceMap\.get\(action\.choiceId\)/);
    assert.match(source, /solveDailyContent\(entry\.day,\s*answer\)/);
});

test('Daily uses stable completion and safe attempt-limit feedback', () => {
    const source = read('src/pages/Rabbit Hole Daily.i6ju2.js');

    assert.match(source, /result\.correct/);
    assert.match(source, /kind:\s*'completed'/);
    assert.doesNotMatch(source, /currentDay\s*\+\s*1|entry\.day\s*\+\s*1/);
    assert.match(source, /DAILY_ATTEMPT_LIMITED/);
    assert.match(source, /seconds/);
    assert.match(source, /No points are awarded here/);
    assert.doesNotMatch(source, /entry\.answer|correctAnswer/);
});

test('Forest exposes one authenticated safe stage and no generated button IDs', () => {
    const backend = read('src/backend/rabbitHole.web.js');
    const source = read('src/pages/Rabbit Hole Forest.l4tqi.js');

    assert.match(backend, /buildForestStageView/);
    assert.match(backend, /export const getForestContent\s*=\s*webMethod\(Permissions\.SiteMember/);
    assert.match(source, /getForestContent/);
    assert.match(source, /bindRabbitQuestionView/);
    assert.doesNotMatch(source, /comp-mvl0wln1|comp-mvl101pj|comp-mvl11a5p/);
    assert.match(source, /choiceMap\.get\(action\.choiceId\)/);
    assert.match(source, /forestEncounter\(choice\.characterId,\s*choice\.actionId\)/);
    assert.match(source, /guardianKey:\s*view\.guardian\?\.characterId/);
});

test('Forest refreshes the authoritative stage after success or stale action', () => {
    const source = read('src/pages/Rabbit Hole Forest.l4tqi.js');

    assert.match(source, /next:\s*await getForestContent\(\)/);
    assert.match(source, /FOREST_PREDECESSOR_REQUIRED/);
    assert.match(source, /FOREST_STAGE_LOCKED/);
    assert.match(source, /result\.next/);
    assert.match(source, /Grumblebark|guardian\.label/);
    assert.match(source, /result\.next\.locked[\s\S]*kind:\s*'locked'/);
    assert.match(source, /if \(!view\)[\s\S]*FOREST_VIEW_UNAVAILABLE/);
    assert.match(source, /onFound:\s*\(\)\s*=>\s*reloadForestQuestion\(\)/);
    assert.match(source, /reloadForestQuestion\s*=\s*questionView\.reload/);
});

test('Cave renders authoritative dialogue and removes generated button IDs', () => {
    const source = read('src/pages/Rabbit Hole Cave.zoimi.js');

    assert.doesNotMatch(source, /comp-mvl0ugrl|comp-mvl0uqjc|comp-mvl0v0ka/);
    assert.doesNotMatch(source, /claimReward/);
    assert.match(source, /bindRabbitQuestionView/);
    assert.match(source, /enterCave\(\)/);
    assert.match(source, /result\.dialogue/);
    assert.match(source, /dialogue\?\.choices[\s\S]*\.map/);
    assert.match(source, /chooseLootgrem\(currentNode,\s*action\.choiceId\)/);
    assert.match(source, /guardianKey:\s*'tanglebright'/);
});

test('Cave maps next dialogue, terminal choices and locked access safely', () => {
    const source = read('src/pages/Rabbit Hole Cave.zoimi.js');

    assert.match(source, /currentNode\s*=\s*result\.next/);
    assert.match(source, /result\.dialogue/);
    assert.match(source, /result\.next\s*===\s*'claim'/);
    assert.match(source, /result\.next\s*===\s*'code'/);
    assert.match(source, /rewardIssuanceEnabled/);
    assert.match(source, /CAVE_LOCKED/);
    assert.match(source, /kind:\s*'locked'/);
    assert.match(source, /choices:\s*\[\]/);
});
