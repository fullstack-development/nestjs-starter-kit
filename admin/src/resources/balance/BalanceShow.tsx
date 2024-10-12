import { ReferenceField, Show, SimpleShowLayout, TextField } from "react-admin";

export const BalanceShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="cash" />
        <TextField label={"User Id"} source={"user.id"} />
        <ReferenceField
          reference={"UserEntity"}
          source={"user.id"}
          label={"User Email"}
        >
          <TextField source={"email"} />
        </ReferenceField>
      </SimpleShowLayout>
    </Show>
  );
};
