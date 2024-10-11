import { Datagrid, DateField, List, TextField } from "react-admin";

export const UsersList = () => {
  return (
    <List resource="UserEntity" title={"Users"}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="email" />
        <TextField source="hash" />
        <DateField source={"createdAt"} />
        <TextField source="balance.id" />
      </Datagrid>
    </List>
  );
};
