import { ArrayField, Datagrid, DateField, List, TextField } from "react-admin";
import { Items } from "./model.tsx";

export const UsersList = () => {
  return (
    <List resource="UserEntity" title={"Users"}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="email" />
        <TextField source="hash" />
        <DateField showTime={true} source={"createdAt"} />
        <TextField source="balance.id" />
        <ArrayField source="items">
          <Items />
        </ArrayField>
      </Datagrid>
    </List>
  );
};
