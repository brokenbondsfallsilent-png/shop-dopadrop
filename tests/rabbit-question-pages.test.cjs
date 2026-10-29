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
