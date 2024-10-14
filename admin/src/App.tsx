import { Admin, Resource } from "react-admin";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UsersList } from "./resources/users/UsersList.tsx";
import { BalancesList } from "./resources/balance/BalancesList.tsx";
import { ItemsList } from "./resources/item/ItemsList.tsx";
import { UserShow } from "./resources/users/UserShow.tsx";
import { BalanceShow } from "./resources/balance/BalanceShow.tsx";
import { ItemShow } from "./resources/item/ItemShow.tsx";
import { BalanceEdit } from "./resources/balance/BalanceEdit.tsx";
import { ItemEdit } from "./resources/item/ItemEdit.tsx";
import { UserEdit } from "./resources/users/UserEdit.tsx";

export const App = () => (
  <Admin layout={Layout} dataProvider={dataProvider}>
    <Resource
      options={{ label: "Users" }}
      name={"UserEntity"}
      list={UsersList}
      show={UserShow}
      edit={UserEdit}
    />
    <Resource
      options={{ label: "Balances" }}
      name={"BalanceEntity"}
      list={BalancesList}
      show={BalanceShow}
      edit={BalanceEdit}
    />
    <Resource
      options={{ label: "Items" }}
      name={"ItemEntity"}
      list={ItemsList}
      show={ItemShow}
      edit={ItemEdit}
    />
  </Admin>
);
