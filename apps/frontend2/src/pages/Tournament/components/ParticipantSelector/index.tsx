import { Form, SelectProps } from "antd";
import { FC } from "react";
import { useParams } from "react-router";
import { Participant, Club as ClubInterface } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";

import {
  getYearSelector,
  useGetClubs,
} from "../../../../react-query-hooks/club/useGetClubs";
import { useGetParticipants } from "../../../../react-query-hooks/participant/useGetParticipants";
import { Club } from "../../../../components/Club";
import { Selector } from "../../../../components/selectors/Selector";
import { BCP47Locales, Language } from "../../../../i18n/locales";

interface Props extends SelectProps {
  formItem?: boolean;
  used?: boolean;
  byCountryId?: number;
  name?: string;
  club?: ClubInterface;
  className?: string;
}

const ParticipantSelector: FC<Props> = ({
  used = true,
  formItem = true,
  byCountryId,
  name = "clubId",
  club,
  className,
  allowClear,
  value,
  onChange,
  onClear,
}) => {
  const { i18n, t } = useTranslation();
  const { season, tournament } = useParams();

  const { data: clubs } = useGetClubs(
    undefined,
    getYearSelector(i18n.resolvedLanguage as Language, season?.split("-")?.[0]),
  );

  const { data: usedClubIds } = useGetParticipants<number[]>(
    season,
    tournament,
    (data: Participant[]) => data.map(({ club }) => club.id),
  );

  const collator = new Intl.Collator(
    BCP47Locales[i18n.resolvedLanguage as Language],
  );

  const options = clubs
    ?.filter(({ id, city }) => {
      const isUsed = (usedClubIds as unknown as number[])?.includes(id);

      return (
        ((used ? isUsed : !isUsed) || (club ? id === club.id : false)) &&
        (byCountryId ? byCountryId === city.country.id : true)
      );
    })
    .sort((a, b) =>
      collator.compare(
        (i18n.resolvedLanguage === Language.en ? a.name : a.name_ua) || a.name,
        (i18n.resolvedLanguage === Language.en ? b.name : b.name_ua) || b.name,
      ),
    );

  const node = (
    <Selector<ClubInterface>
      options={options}
      renderOption={(option) => <Club club={option} to={false} />}
      className={className}
      allowClear={allowClear}
      placeholder={t("common.placeholder.club")}
      {...(formItem ? {} : { value, onChange, onClear })}
    />
  );

  return formItem ? (
    <Form.Item name={name} rules={[{ required: true }]}>
      {node}
    </Form.Item>
  ) : (
    node
  );
};

export { ParticipantSelector };
