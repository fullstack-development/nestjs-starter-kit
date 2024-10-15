export const objToString = (value: unknown): string => {
    return typeof value === 'object' ? JSON.stringify(value) : `${value}`;
};
