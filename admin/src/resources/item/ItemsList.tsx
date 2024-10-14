import {Datagrid, List, TextField} from "react-admin";

export const ItemsList = () => {
    return (
        <List resource="ItemEntity" title={"Balances"}>
            <Datagrid>
                <TextField source="id"/>
                <TextField source="type"/>
                <TextField source={"user.id"}/>
            </Datagrid>
        </List>
    );
};
