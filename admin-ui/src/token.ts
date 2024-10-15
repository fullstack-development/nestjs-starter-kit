export const getToken = () => window.localStorage.getItem('token');
export const setToken = (token: string) => {
    window.localStorage.setItem('token', token);
};
export const clearToken = () => {
    window.localStorage.removeItem('token');
};
