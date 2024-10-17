import { ParticipantDto } from "@fbs2.0/types";
import { Button, Checkbox, Form } from "antd";
import { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AddClubForm } from "./components/AddClubForm";
import { SubmitButton } from "../../../../../../components/SubmitButton";
import { ParticipantSelector } from "../../../ParticipantSelector";
import { StageTypeSelector } from "../../../../../../components/selectors/StageTypeSelector";
import { CountrySelector } from "../../../../../../components/selectors/CountrySelector";
import { useCreateParticipant } from "../../../../../../react-query-hooks/participant/useCreateParticipant";

import styles from "./styles.module.scss";

interface Props {
  close: () => void;
  selectedCountryId: number | undefined;
}

const AddForm: FC<Props> = ({ close, selectedCountryId }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<ParticipantDto>();
  const createParticipant = useCreateParticipant();

  const [countryId, setCountryId] = useState<number | undefined>();
  const [isAddClubOpen, setIsAddClubOpen] = useState(false);
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

  useEffect(() => {
    if (!countryId && isAddClubOpen) {
      setIsAddClubOpen(false);
    }
  }, [countryId, isAddClubOpen]);

  return (
    <>
      <Form form={form} layout="horizontal" onFinish={submit}>
        <div className={styles.selectors}>
          <div className={styles.participant}>
            <CountrySelector
              value={countryId}
              formItem={false}
              onChange={(value) => setCountryId(value)}
              oldCountriesConfig={{ disable: true }}
              className={styles.country}
            />
            <ParticipantSelector used={false} byCountryId={countryId} />
          </div>
          <StageTypeSelector startingStages name="startingStage" />
        </div>
        <div className={styles.buttons}>
          <span>
            {!isAddClubOpen && (
              <div className={styles.submission}>
                <SubmitButton
                  form={form}
                  size="small"
                  loading={createParticipant.isPending}
                  className={styles["submission-button"]}
                />
                <Checkbox
                  checked={addMore}
                  onChange={() => setAddMore(!addMore)}
                >
                  {t("common.add_more")}
                </Checkbox>
              </div>
            )}
          </span>
          <Button
            type="link"
            size="small"
            onClick={() => setIsAddClubOpen(!isAddClubOpen)}
            disabled={!countryId}
          >
            {isAddClubOpen
              ? t("common.close")
              : t("tournament.participants.list.add_club")}
          </Button>
        </div>
      </Form>
      {isAddClubOpen && countryId && (
        <AddClubForm countryId={countryId} className={styles["add-club"]} />
      )}
    </>
  );
};

export { AddForm };
