import { Admin, Resource } from "react-admin";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UsersList } from "./resources/users/UsersList.tsx";
import { BalancesList } from "./resources/balance/BalancesList.tsx";
import { ItemsList } from "./resources/item/ItemsList.tsx";

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
    <Resource
      options={{ label: "Items" }}
      name={"ItemEntity"}
      list={ItemsList}
    />
  </Admin>
);
