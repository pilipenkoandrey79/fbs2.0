import { FC, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Country as CountryInterface } from "@fbs2.0/types";

import { CvContext } from "../../../../context/cvContext";
import { useCvContext } from "../../../../context/useCvContext";
import { Country } from "./components/Country";
import { useGetCountries } from "../../../../react-query-hooks/country/useGetCountries";
import { Paths } from "../../../../routes";

const CountryPage: FC = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const countries = useGetCountries();
  const country = countries.data?.find((country) => country.code === code);

  useEffect(() => {
    if (countries.isSuccess && !country) {
      navigate(Paths.CLUBS);
    }
  }, [countries.isSuccess, country, navigate]);

  return country && <CountryWrapper country={country} />;
};

interface CountryWrapperProps {
  country: CountryInterface;
}

const CountryWrapper: FC<CountryWrapperProps> = ({ country }) => {
  const cvValueState = useCvContext(country.id);

  return (
    <CvContext.Provider value={cvValueState}>
      <Country country={country} />
    </CvContext.Provider>
  );
};

export { CountryPage };
