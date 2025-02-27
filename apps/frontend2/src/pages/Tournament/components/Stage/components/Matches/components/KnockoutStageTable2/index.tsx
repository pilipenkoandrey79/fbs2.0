import { Group } from "@fbs2.0/types";
import { FC, useContext, useState } from "react";
import { Button, Empty } from "antd";
import { EditTwoTone } from "@ant-design/icons";

import { TableView } from "./components/TableView";
import {
  BaseEditTableProps,
  EditTableDialog,
} from "./components/EditTableDialog";
import { UserContext } from "../../../../../../../../context/userContext";

import styles from "./styles.module.scss";

const KnockoutStageTable: FC<BaseEditTableProps> = (props) => {
  const { participants, stage, matches, group, tour } = props;
  const rows = matches?.[group as Group]?.tours?.[tour || 1] || [];
  const [editing, setEditing] = useState(false);
  const { user } = useContext(UserContext);

  return (
    <div className={styles.container}>
      {user?.isEditor && (
        <>
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
        </>
      )}
      {rows.length > 0 ? (
        <TableView rows={rows} stage={stage} />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} className={styles.empty} />
      )}
    </div>
  );
};

export { KnockoutStageTable };
