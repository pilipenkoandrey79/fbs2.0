import { Segmented } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { useLocation, useNavigate, useParams } from "react-router";
import { Country } from "@fbs2.0/types";

import { Language } from "../../i18n/locales";
import { Flag } from "../Flag";

interface Props {
  className?: string;
}

const LanguageSwitcher: FC<Props> = ({ className }) => {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const { pathname, search } = useLocation();

  const navigate = useNavigate();

  const flagCountry: Country = {
    id: 0,
    name: "",
    code: i18n.resolvedLanguage === Language.en ? "gb" : "ua",
    from: null,
    till: null,
  };

  return (
    <Segmented
      options={Object.keys(Language).map((value) => ({
        label: (
          <span>
            {value === i18n.resolvedLanguage && <Flag country={flagCountry} />}
            <span style={{ marginLeft: 4 }}>{value.toUpperCase()}</span>
          </span>
        ),
        value,
      }))}
      value={i18n.resolvedLanguage}
      onChange={(value) => {
        i18n.changeLanguage(value);

        dayjs.locale(value);

        navigate("/" + value + pathname.replace(`${lang}/`, "") + search);
      }}
      className={className}
    />
  );
};

export { LanguageSwitcher };
