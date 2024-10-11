import { Admin, Resource } from "react-admin";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UsersList } from "./resources/users/UsersList.tsx";
import { BalancesList } from "./resources/balance/BalancesList.tsx";

export const App = () => (
  <Admin layout={Layout} dataProvider={dataProvider}>
    <Resource
      options={{ label: "Users" }}
      name={"UserEntity"}
      list={UsersList}
    />
    <Resource
      options={{ label: "Balances" }}
      name={"BalanceEntity"}
      list={BalancesList}
    />
  </Admin>
);
