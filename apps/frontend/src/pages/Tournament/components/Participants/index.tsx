import { Button, Intent } from "@blueprintjs/core";
import {
  Club as ClubInterface,
  Country,
  Participant,
  Stage,
  StageType,
  Tournament,
} from "@fbs2.0/types";
import classNames from "classnames";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import { isNotEmpty } from "@fbs2.0/utils";

import { CountrySelector } from "../../../../components/selectors/CountrySelector";
import { ParticipantsTable } from "./components/ParticipantsTable";
import { usePrevious } from "../../../../hooks/usePrevious";
import { UserContext } from "../../../../context/userContext";
import { useAddParticipants } from "../../../../react-query-hooks/participants/useAddParticipants";
import { useCopyParticipants } from "../../../../react-query-hooks/participants/useCopyParticipants";

import styles from "./styles.module.scss";

interface Props {
  participants: Participant[];
  version: number;
  countries: Country[];
  clubs: ClubInterface[];
  stages: Stage[];
  hasLinkedTournament: boolean;
  season?: string;
  tournament: Tournament;
}

const filterParticipants = (
  participants: Participant[],
  countryId: number | null
) =>
  participants
    .filter((item) => item.club.city.country.id === countryId)
    .sort((a, b) => {
      const stages = Object.values(StageType);

      const comparison =
        stages.indexOf(b.startingStage) - stages.indexOf(a.startingStage);

      return comparison === 0 ? a.id - b.id : comparison;
    });

const Participants: FC<Props> = ({
  participants,
  version,
  countries,
  clubs,
  stages,
  hasLinkedTournament,
  season,
  tournament,
}) => {
  const { user } = useContext(UserContext);

  const [filteredData, setFilteredData] = useState<Participant[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null
  );

  const { mutate: addParticipants } = useAddParticipants();
  const { mutate: copyParticipants } = useCopyParticipants();

  const previousVersion = usePrevious(version);

  const clubsToBeAdded = useMemo(() => {
    const existedIds = participants.map(({ club }) => club.id);

    return clubs
      .filter(({ id }) => !existedIds.includes(id))
      .sort((a, b) => {
        const collator = new Intl.Collator("uk");

        return collator.compare(a.name, b.name);
      });
  }, [clubs, participants]);

  const onCountrySelect = ({ id }: Country) => {
    setSelectedCountryId(id);
    setFilteredData(filterParticipants(participants, id));
  };

  const resetSelection = () => {
    setSelectedCountryId(null);
    setFilteredData(participants);
  };

  useEffect(() => {
    if (version !== previousVersion) {
      setFilteredData(() =>
        isNotEmpty(selectedCountryId)
          ? filterParticipants(participants, selectedCountryId)
          : participants
      );
    }
  }, [
    participants,
    participants.length,
    previousVersion,
    selectedCountryId,
    version,
  ]);

  return (
    <>
      <div className={styles.header}>
        <div className={styles["country-selector"]}>
          <CountrySelector
            countries={countries}
            onSelect={onCountrySelect}
            selectedCountryId={selectedCountryId}
            className={styles["country-selector-dropdown"]}
            buttonClassName={classNames(
              styles["country-selector-dropdown-button"],
              {
                [styles["country-selector-dropdown-button-empty"]]:
                  !selectedCountryId,
              }
            )}
          />
          <Button
            icon="cross"
            onClick={() => resetSelection()}
            className={styles["country-selector-reset"]}
            disabled={!selectedCountryId}
          />
        </div>
        {user?.isEditor && participants.length === 0 && (
          <Button
            intent={Intent.NONE}
            text="Скопіювати учасників з попереднього сезону"
            small
            onClick={() => copyParticipants({ season, tournament })}
          />
        )}
        {user?.isEditor && hasLinkedTournament && (
          <Button
            intent={Intent.PRIMARY}
            text="Додати учасників з іншого турніру"
            small
            onClick={() => addParticipants({ season, tournament })}
          />
        )}
      </div>
      <ParticipantsTable
        participants={filteredData}
        selectedCountryId={selectedCountryId}
        countries={countries}
        clubsToBeAdded={clubsToBeAdded}
        stages={stages}
        season={season}
        tournament={tournament}
      />
    </>
  );
};

export { Participants };
