import { FC, HTMLAttributes, PropsWithChildren, useEffect } from "react";
import { Checkbox, Form, FormInstance, Select } from "antd";
import { useTranslation } from "react-i18next";
import { MatchDto, Participant } from "@fbs2.0/types";

import { Club } from "../../../../../../../../../../components/Club";
import { SubmitButton } from "../../../../../../../../../../components/SubmitButton";

import styles from "./styles.module.scss";

export interface EditableCellProps extends HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: "hostId" | "guestId" | "results";
  participants?: Participant[];
  form?: FormInstance<MatchDto>;
  addMore?: boolean;
  loading?: boolean;
  setAddMore?: (addMore: boolean) => void;
}

const EditableCell: FC<PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  children,
  participants,
  form,
  addMore,
  loading,
  setAddMore,
  ...restProps
}) => {
  const { i18n, t } = useTranslation();
  const collator = new Intl.Collator(i18n.resolvedLanguage);

  const selectedRivalId = Form.useWatch(
    dataIndex === "guestId" ? "hostId" : "guestId",
    form
  );

  const options = participants
    ?.filter(({ id }) => selectedRivalId !== id)
    .sort((a, b) => collator.compare(a.club.name, b.club.name));

  const node =
    dataIndex === "results" ? (
      <div className={styles.submission}>
        <SubmitButton
          form={form}
          size="small"
          loading={loading}
          label={t("common.save")}
        />
        <Checkbox checked={addMore} onChange={() => setAddMore?.(!addMore)}>
          {t("common.add_more")}
        </Checkbox>
      </div>
    ) : (
      <Form.Item name={dataIndex} rules={[{ required: true }]}>
        <Select
          size="small"
          showSearch
          filterOption={(input, option) =>
            (option?.["data-label"] ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          allowClear
          placeholder={t("common.placeholder.club")}
        >
          {options?.map((option) => (
            <Select.Option
              key={option.id}
              value={option.id}
              data-label={option.club.name}
            >
              <Club club={option.club} />
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );

  useEffect(() => {
    if (dataIndex !== "results" && options?.length === 1) {
      form?.setFieldValue(dataIndex, options[0].id);
    }
  }, [dataIndex, form, options]);

  return <td {...restProps}>{editing ? node : children}</td>;
};

export { EditableCell };
