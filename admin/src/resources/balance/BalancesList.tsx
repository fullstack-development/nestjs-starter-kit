import {Datagrid, List, ReferenceField, TextField} from "react-admin";

export const BalancesList = () => {
    return (
        <List resource="BalanceEntity" title={"Balances"}>
            <Datagrid>
                <TextField source="id"/>
                <TextField source="cash"/>
                <TextField label={"User Id"} source={"user.id"}/>
                <ReferenceField
                    reference={"UserEntity"}
                    source={"user.id"}
                    label={"User Email"}
                >
                    <TextField source={"email"}/>
                </ReferenceField>
            </Datagrid>
        </List>
    );
};
