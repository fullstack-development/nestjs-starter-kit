import { DateInput, Edit, required, SimpleForm, TextInput } from "react-admin";

export const UserEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <TextInput readOnly name={"id"} label="id" source="id" />
        <TextInput name={"email"} source="email" validate={required()} />
        <TextInput name={"hash"} source="hash" validate={required()} />
        <DateInput
          name={"createdAt"}
          source={"createdAt"}
          validate={required()}
        />
      </SimpleForm>
    </Edit>
  );
};
