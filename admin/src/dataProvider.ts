import simpleRestProvider from "ra-data-simple-rest";

export const dataProvider = simpleRestProvider(
  "http://localhost:3700/api/admin/db",
);
