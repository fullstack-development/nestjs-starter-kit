import {
  ArrayField,
  Datagrid,
  DateField,
  List,
  TextField,
  useRecordContext,
} from "react-admin";

const Items = () => {
  const record = useRecordContext();
  return <div>{record?.items.map((i: any) => i.type).join(", ")}</div>;
};

export const UsersList = () => {
  return (
    <List resource="UserEntity" title={"Users"}>
      <Datagrid>
        <TextField source="id" />
        <TextField source="email" />
        <TextField source="hash" />
        <DateField source={"createdAt"} />
        <TextField source="balance.id" />
        <ArrayField source="items">
          <Items />
        </ArrayField>
      </Datagrid>
    </List>
  );
};
