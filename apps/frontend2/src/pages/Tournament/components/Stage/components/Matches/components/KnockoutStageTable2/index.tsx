import { Group, Participant } from "@fbs2.0/types";
import { FC, useMemo, useState } from "react";
import { Button, Empty } from "antd";
import { EditTwoTone } from "@ant-design/icons";

import { TableView } from "./components/TableView";
import {
  BaseEditTableProps,
  EditTableDialog,
} from "./components/EditTableDialog";
import { getFilteredParticipants } from "../../../../utils";

import styles from "./styles.module.scss";

const KnockoutStageTable: FC<BaseEditTableProps> = (props) => {
  const { participants, stage, matches, group, tour } = props;
  const rows = matches?.[group as Group]?.tours?.[tour || 1] || [];
  const [editing, setEditing] = useState(false);

  return (
    <div className={styles.container}>
      <Button
        icon={<EditTwoTone />}
        type="text"
        size="small"
        onClick={() => setEditing(true)}
      />
      <EditTableDialog
        {...props}
        matches={matches}
        participants={participants}
        onClose={() => setEditing(false)}
        open={editing}
      />
      {rows.length > 0 ? (
        <TableView rows={rows} stage={stage} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles.empty} />
      )}
    </div>
  );
};

export { KnockoutStageTable };
