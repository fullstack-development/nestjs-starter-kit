import { useRecordContext } from "react-admin";

export const Items = () => {
  const record = useRecordContext();
  return <div>{record?.items.map((i: any) => i.type).join(", ")}</div>;
};
