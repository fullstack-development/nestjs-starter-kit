import { Show, SimpleShowLayout, TextField } from "react-admin";

export const ItemShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="type" />
        <TextField source={"user.id"} />
      </SimpleShowLayout>
    </Show>
  );
};
