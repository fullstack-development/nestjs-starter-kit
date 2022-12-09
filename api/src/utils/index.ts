import { v4 } from 'uuid';

let uuidIndex = 0;
export function uuid() {
    return process.env.TEST === 'true' ? `uuid-${++uuidIndex}` : v4();
}

let dateIndex = 0;
function now() {
    return process.env.TEST === 'true' ? new Date(++dateIndex) : new Date();
}

function from(value: number | string | Date) {
    return new Date(value);
}

export const date = {
    now,
    from,
};
