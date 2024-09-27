import { Participant } from "@fbs2.0/types";
import { FC, HTMLAttributes, PropsWithChildren } from "react";

import { ClubSelector } from "./components/ClubSelector";
import { StageSelector } from "./components/StageSelector";

export interface EditableCellProps extends HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: keyof Participant;
  title: string;
  record: Participant | undefined;
  index: number;
}

const EditableCell: FC<PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  record,
  children,
  ...restProps
}) => {
  const node =
    dataIndex === "club" ? (
      <ClubSelector record={record} name="club" />
    ) : dataIndex === "startingStage" ? (
      <StageSelector name="startingStage" />
    ) : null;

  return <td {...restProps}>{editing ? node : children}</td>;
};

export { EditableCell };
