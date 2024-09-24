import { FC, useContext } from "react";
import { useParams } from "react-router";
import { useSearchParams } from "react-router-dom";

import { Page } from "../../components/Page";
import { UserContext } from "../../context/userContext";
import { useGetMatches } from "../../react-query-hooks/match/useGetMatches";

const Tournament: FC = () => {
  const { season, tournament } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(UserContext);

  const { data, isLoading, isError, error } = useGetMatches(season, tournament);

  return (
    <Page isLoading={isLoading} error={isError ? error : null}>
      xbdgbdgb
    </Page>
  );
};

export { Tournament };
