import {Edit, required, SimpleForm, TextInput} from "react-admin";

export const ItemEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput readOnly name={"id"} label="id" source="id"/>
                <TextInput name={"type"} source="type" validate={required()}/>
            </SimpleForm>
        </Edit>
    );
};
