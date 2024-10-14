import { Edit, required, SimpleForm, TextInput } from "react-admin";

export const BalanceEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput disabled name={"id"} label="id" source="id" />
        <TextInput name={"cash"} source="cash" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};
