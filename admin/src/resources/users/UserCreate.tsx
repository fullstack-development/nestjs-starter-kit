import {
  Create,
  DateInput,
  NumberInput,
  required,
  SimpleForm,
  TextInput,
} from "react-admin";

export const UserCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput name={"email"} source="email" validate={required()} />
        <TextInput name={"hash"} source="hash" validate={required()} />
        <DateInput name={"createdAt"} source={"createdAt"} />
        <NumberInput
          name={"balance.id"}
          source="balance.id"
          validate={required()}
        />
      </SimpleForm>
    </Create>
  );
};
