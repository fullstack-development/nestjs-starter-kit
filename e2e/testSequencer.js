const Sequencer = require('@jest/test-sequencer').default;
const path = require('path');

class CustomSequencer extends Sequencer {
    sort(tests) {
        const order = [
            'auth.controller.spec.ts',
            'user.controller.spec.ts'
        ];

        let orderedTests = [];
        for (let i = 0; i < tests.length; i++) {
            const name = path.basename(tests[i].path);
            const index = order.findIndex((v) => v === name);
            if (index === -1) {
                throw `${name} test is not included in the order list!`;
            }
            orderedTests[index] = tests[i];
        }

        return orderedTests.filter((t) => t !== undefined && t !== null);
    }
}

module.exports = CustomSequencer;
