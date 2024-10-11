import {
  Admin,
  Resource,
  ListGuesser,
  EditGuesser,
  ShowGuesser,
} from "react-admin";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";
import { UsersList } from "./resources/users/UsersList.tsx";

export const App = () => (
  <Admin layout={Layout} dataProvider={dataProvider}>
    <Resource name={"UserEntity"} list={UsersList} />
  </Admin>
);
