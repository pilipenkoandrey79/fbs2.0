import { Segmented } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router";

import { Language } from "../../i18n/locales";

interface Props {
  className?: string;
}

const LanguageSwitcher: FC<Props> = ({ className }) => {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const { pathname } = useLocation();

  const navigate = useNavigate();

  return (
    <Segmented
      options={Object.keys(Language).map((value) => ({
        label: value.toUpperCase(),
        value,
      }))}
      value={i18n.resolvedLanguage}
      onChange={(value) => {
        i18n.changeLanguage(value);

        dayjs.locale(value);

        navigate("/" + value + pathname.replace(`${lang}/`, ""));
      }}
      className={className}
    />
  );
};

export { LanguageSwitcher };
