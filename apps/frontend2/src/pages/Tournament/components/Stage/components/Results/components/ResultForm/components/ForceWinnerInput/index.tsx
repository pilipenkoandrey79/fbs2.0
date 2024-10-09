import { Form, Segmented } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { ClubWithWinner } from "@fbs2.0/types";

import { Club } from "../../../../../../../../../../components/Club";

interface Props {
  host: ClubWithWinner;
  guest: ClubWithWinner;
}

const ForceWinnerInput: FC<Props> = ({ host, guest }) => {
  const { t } = useTranslation();

  return (
    <Form.Item
      name="forceWinnerId"
      label={t("tournament.stages.results.form.force_winner")}
    >
      <Segmented
        options={[
          {
            label: <Club club={host.club} showCity={false} />,
            value: host.id,
          },
          {
            label: <Club club={guest.club} showCity={false} />,
            value: guest.id,
          },
        ]}
      />
    </Form.Item>
  );
};

export { ForceWinnerInput };
