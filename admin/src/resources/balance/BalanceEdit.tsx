import {
  Edit,
  NumberInput,
  required,
  SimpleForm,
  TextInput,
} from "react-admin";

export const BalanceEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput disabled name={"id"} label="id" source="id" />
        <NumberInput name={"cash"} source="cash" validate={required()} />
      </SimpleForm>
    </Edit>
  );
};
