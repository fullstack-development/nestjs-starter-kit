import { v4 } from 'uuid';

let uuidIndex = 0;
export const uuid = () => (process.env.TEST === 'true' ? `uuid-${++uuidIndex}` : v4());

let dateIndex = 0;
export const date = {
    now: () => (process.env.TEST === 'true' ? new Date(++dateIndex) : new Date()),
    from: (value: number | string | Date) => new Date(value),
};
