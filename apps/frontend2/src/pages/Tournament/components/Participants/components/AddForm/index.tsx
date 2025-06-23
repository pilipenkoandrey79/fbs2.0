import { ParticipantDto } from "@fbs2.0/types";
import { Checkbox, Form } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { SubmitButton } from "../../../../../../components/SubmitButton";
import { ParticipantSelector } from "../../../ParticipantSelector";
import { StageSelector } from "../../../../../../components/selectors/StageSelector";
import { CountrySelector } from "../../../../../../components/selectors/CountrySelector";
import { useCreateParticipant } from "../../../../../../react-query-hooks/participant/useCreateParticipant";

import styles from "./styles.module.scss";

interface Props {
  close: () => void;
  selectedCountryId: number | undefined;
  year: string | undefined;
}

const AddForm: FC<Props> = ({ close, selectedCountryId, year }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ParticipantDto>();
  const createParticipant = useCreateParticipant();

  const [countryId, setCountryId] = useState<number | undefined>();
  const [addMore, setAddMore] = useState(true);

  const submit = async (values: ParticipantDto) => {
    await createParticipant.mutateAsync(values);

    if (addMore) {
      form.resetFields();
    } else {
      close();
    }
  };

  useEffect(() => {
    setCountryId(selectedCountryId);
  }, [selectedCountryId]);

  return (
    <>
      <Form form={form} layout="horizontal" onFinish={submit}>
        <div className={styles.selectors}>
          <div className={styles.participant}>
            <CountrySelector
              value={countryId}
              formItem={false}
              onChange={(value) => setCountryId(value)}
              year={year}
              className={styles.country}
            />
            <ParticipantSelector used={false} byCountryId={countryId} />
          </div>
          <StageSelector startingStages name="startingStage" />
        </div>
        <div className={styles.buttons}>
          <div className={styles.submission}>
            <SubmitButton
              form={form}
              size="small"
              loading={createParticipant.isPending}
              className={styles["submission-button"]}
            />
            <Checkbox checked={addMore} onChange={() => setAddMore(!addMore)}>
              {t("common.add_more")}
            </Checkbox>
          </div>
        </div>
      </Form>
    </>
  );
};

export { AddForm };
