import { Participant } from "@fbs2.0/types";
import { FC, HTMLAttributes, PropsWithChildren } from "react";

import { ParticipantSelector } from "../../../../../../../../components/selectors/ParticipantSelector";
import { StageTypeSelector } from "../../../../../../../../components/selectors/StageTypeSelector";

export interface EditableCellProps extends HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: keyof Participant;
  record: Participant | undefined;
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
      <ParticipantSelector
        used={false}
        club={record?.club}
        byCountryId={record?.club.city.country.id}
        name="club"
      />
    ) : dataIndex === "startingStage" ? (
      <StageTypeSelector name="startingStage" startingStages />
    ) : null;

  return <td {...restProps}>{editing ? node : children}</td>;
};

export { EditableCell };
