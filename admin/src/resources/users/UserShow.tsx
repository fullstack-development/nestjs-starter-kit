import {
  ArrayField,
  DateField,
  Show,
  SimpleShowLayout,
  TextField,
} from "react-admin";
import { Items } from "./model.tsx";

export const UserShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="email" />
        <TextField source="hash" />
        <DateField showTime={true} source={"createdAt"} />
        <TextField source="balance.id" />
        <ArrayField source="items">
          <Items />
        </ArrayField>
      </SimpleShowLayout>
    </Show>
  );
};
