import {
  Create,
  NumberInput,
  required,
  SimpleForm,
  TextInput,
} from "react-admin";

export const ItemCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput name={"type"} source="type" validate={required()} />
        <NumberInput name={"user.id"} source="user.id" validate={required()} />
      </SimpleForm>
    </Create>
  );
};
