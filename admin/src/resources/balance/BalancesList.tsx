import { Datagrid, List, TextField } from "react-admin";

export const BalancesList = () => {
  return (
    <List resource="BalanceEntity" title={"Balances"}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="cash" />
        <TextField source={"user.id"} />
      </Datagrid>
    </List>
  );
};
