import { Participant } from "@fbs2.0/types";
import { FC } from "react";
import { Button, FormInstance, Popconfirm } from "antd";
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { useUpdateParticipant } from "../../../../../../../../react-query-hooks/participant/useUpdateParticipant";
import { useDeleteParticipant } from "../../../../../../../../react-query-hooks/participant/useDeleteParticipant";

import styles from "./styles.module.scss";

interface Props {
  record: Participant;
  form: FormInstance;
  pristine: boolean;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  setPristine: (pristine: boolean) => void;
}

const ActionsCell: FC<Props> = ({
  record,
  form,
  pristine,
  editingId,
  setEditingId,
  setPristine,
}) => {
  const { t } = useTranslation();
  const updateParticipant = useUpdateParticipant();
  const deleteParticipant = useDeleteParticipant();

  const save = async (id: number) => {
    const values = await form.validateFields();

    await updateParticipant.mutateAsync({
      id,
      participantDto: {
        clubId: values.club,
        startingStage: values.startingStage,
      },
    });

    cancel();
  };

  const edit = (record: Partial<Participant>) => {
    form.setFieldsValue({
      club: record.club?.id,
      startingStage: record.startingStage,
    });

    setEditingId(record.id ?? null);
  };

  const cancel = () => {
    setEditingId(null);
    setPristine(true);
  };

  const remove = async (id: number) => {
    await deleteParticipant.mutateAsync(id);

    cancel();
  };

  if (record?.fromStage) {
    return null;
  }

  return (
    <span className={styles.buttons}>
      {record.id === editingId ? (
        <>
          <Button
            type="link"
            size="small"
            icon={<SaveOutlined />}
            onClick={() => save(record?.id)}
            disabled={updateParticipant.isPending || pristine}
          />
          <Button
            type="link"
            size="small"
            icon={<CloseOutlined />}
            onClick={cancel}
            disabled={updateParticipant.isPending}
          />
        </>
      ) : (
        <>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            disabled={editingId !== null}
            onClick={() => edit(record)}
          />
          <Popconfirm
            title={t("common.remove")}
            description={t("tournament.participants.list.remove_confirm")}
            onConfirm={() => remove(record.id)}
          >
            <Button
              type="link"
              size="small"
              icon={<DeleteOutlined />}
              disabled={editingId !== null}
            />
          </Popconfirm>
        </>
      )}
    </span>
  );
};

export { ActionsCell };
