import { Create, required, SimpleForm, TextInput } from "react-admin";

export const BalanceCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput name={"cash"} source="cash" validate={required()} />
      </SimpleForm>
    </Create>
  );
};
