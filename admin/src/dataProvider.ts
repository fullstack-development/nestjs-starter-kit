import simpleRestProvider from "ra-data-simple-rest";

export const dataProvider = simpleRestProvider(
    import.meta.env.VITE_DB_REST_URL,
);
