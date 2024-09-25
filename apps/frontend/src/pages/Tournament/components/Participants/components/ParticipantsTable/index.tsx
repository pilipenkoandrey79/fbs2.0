import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Cell, Column, Table2 } from "@blueprintjs/table";
import {
  Club as ClubInterface,
  Country,
  Participant,
  Stage,
  StageType,
  TABLE_ROW_HEIGHT,
  Tournament,
} from "@fbs2.0/types";
import { getStageLabel, _getTournamentTitle, isNotEmpty } from "@fbs2.0/utils";
import { Button } from "@blueprintjs/core";
import classNames from "classnames";

import { UserContext } from "../../../../../../context/userContext";
import { ClubSelector } from "../../../../../../components/selectors/ClubSelector";
import { Club } from "../../../../../../components/Club";
import { StageTypeSelector } from "../../../../../../components/selectors/StageTypeSelector";
import { useCreateParticipant } from "../../../../../../react-query-hooks/participants/useCreateParticipant";
import { useDeleteParticipant } from "../../../../../../react-query-hooks/participants/useDeleteParticipant";
import { useUpdateParticipant } from "../../../../../../react-query-hooks/participants/useUpdateParticipant";

import styles from "./styles.module.scss";

interface Props {
  participants: Participant[];
  selectedCountryId: number | null;
  countries: Country[];
  clubsToBeAdded: ClubInterface[];
  stages: Stage[];
  season?: string;
  tournament: Tournament;
}

const ParticipantsTable: FC<Props> = ({
  participants,
  countries,
  selectedCountryId,
  clubsToBeAdded,
  stages,
  season,
  tournament,
}) => {
  const { user } = useContext(UserContext);
  const [adding, setAdding] = useState(false);
  const [indexMap, setIndexMap] = useState<number[]>([]);

  const [newParticipantClub, setNewParticipantClub] =
    useState<ClubInterface | null>(null);

  const [newParticipantStartingStage, setNewParticipantStartingStage] =
    useState<StageType | null>(null);

  const [editingParticipantIdx, setEditingParticipantIdx] = useState<
    null | number
  >(null);

  const [editingParticipant, setEditingParticipant] =
    useState<Participant | null>(null);

  const { mutate: addParticipant } = useCreateParticipant((result) => {
    if (result) {
      setNewParticipantClub(null);
      setNewParticipantStartingStage(null);
    }

    setAdding(false);
  });

  const { mutate: deleteParticipant } = useDeleteParticipant();

  const { mutate: editParticipant } = useUpdateParticipant((result) => {
    if (result) {
      setEditingParticipantIdx(null);
      setEditingParticipant(null);
    }
  });

  const shouldShowFromColumn = useMemo(
    () => participants.some(({ fromStage }) => isNotEmpty(fromStage)),
    [participants]
  );

  const columnWidths = useMemo(() => {
    const widths = [100, 200, 250];

    if (shouldShowFromColumn) {
      widths.push(250);
    }

    if (user?.isEditor) {
      widths.push(60);
    }

    return widths;
  }, [shouldShowFromColumn, user?.isEditor]);

  const addNewParticipant = useCallback(() => {
    if (newParticipantClub === null || newParticipantStartingStage === null) {
      return;
    }

    addParticipant({
      tournament,
      season,
      participantDto: {
        clubId: newParticipantClub?.id,
        startingStage: newParticipantStartingStage,
      },
    });
  }, [
    addParticipant,
    newParticipantClub,
    newParticipantStartingStage,
    season,
    tournament,
  ]);

  const onEditParticipant = useCallback(() => {
    if (editingParticipant === null) {
      return;
    }

    editParticipant({
      id: editingParticipant.id,
      participantDto: {
        clubId: editingParticipant.club.id,
        startingStage: editingParticipant.startingStage,
      },
    });
  }, [editParticipant, editingParticipant]);

  const countryCellRenderer = useCallback(
    (rowIndex: number) => {
      const row = participants[rowIndex];

      const countryId =
        selectedCountryId || newParticipantClub?.city?.country?.id;

      if (!row) {
        return isNotEmpty(countryId) ? (
          <Cell>{countries.find(({ id }) => id === countryId)?.name}</Cell>
        ) : undefined;
      }

      return (
        <Cell
          className={classNames({
            [styles["from-another-tournament"]]: !!row.fromStage,
          })}
        >
          {row.club?.city?.country?.name}
        </Cell>
      );
    },
    [
      countries,
      newParticipantClub?.city?.country?.id,
      participants,
      selectedCountryId,
    ]
  );

  const clubCellRenderer = useCallback(
    (rowIndex: number) => {
      const row = participants[rowIndex];

      if (isNotEmpty(row) && editingParticipantIdx !== rowIndex) {
        return (
          <Cell
            className={classNames(styles["club-cell"], {
              [styles["from-another-tournament"]]: !!row.fromStage,
            })}
          >
            <Club club={row.club} />
          </Cell>
        );
      }

      return (
        <Cell className={styles["club-cell"]}>
          <ClubSelector
            clubs={
              editingParticipantIdx === rowIndex
                ? [
                    ...clubsToBeAdded,
                    editingParticipant?.club || ({} as ClubInterface),
                  ]
                : clubsToBeAdded
            }
            selectedClubId={
              (editingParticipantIdx === rowIndex
                ? editingParticipant?.club?.id
                : newParticipantClub?.id) ?? null
            }
            selectedCountryId={
              (editingParticipantIdx === rowIndex
                ? editingParticipant?.club?.city.country.id
                : selectedCountryId) ?? undefined
            }
            onSelect={(club) => {
              editingParticipantIdx === rowIndex
                ? setEditingParticipant({
                    ...(editingParticipant as Participant),
                    club,
                  })
                : setNewParticipantClub(club);
            }}
            className={styles["club-selector"]}
            buttonClassName={styles["club-selector-button"]}
            filterable
          />
        </Cell>
      );
    },
    [
      clubsToBeAdded,
      editingParticipant,
      editingParticipantIdx,
      newParticipantClub?.id,
      participants,
      selectedCountryId,
    ]
  );

  const startCellRenderer = useCallback(
    (rowIndex: number) => {
      const row = participants[rowIndex];

      if (isNotEmpty(row) && editingParticipantIdx !== rowIndex) {
        return (
          <Cell
            className={classNames({
              [styles["from-another-tournament"]]: !!row.fromStage,
            })}
          >
            {getStageLabel(row.startingStage)}
          </Cell>
        );
      }

      return (
        <Cell>
          <StageTypeSelector
            stages={stages.filter(({ stageScheme }) => stageScheme.isStarting)}
            selectedStageType={
              editingParticipantIdx === rowIndex
                ? editingParticipant?.startingStage || null
                : newParticipantStartingStage
            }
            onSelect={(stage) => {
              editingParticipantIdx === rowIndex
                ? setEditingParticipant({
                    ...(editingParticipant as Participant),
                    startingStage: stage,
                  })
                : setNewParticipantStartingStage(stage);
            }}
            className={styles["club-selector"]}
            buttonClassName={styles["club-selector-button"]}
          />
        </Cell>
      );
    },
    [
      editingParticipant,
      editingParticipantIdx,
      newParticipantStartingStage,
      participants,
      stages,
    ]
  );

  const fromCellRenderer = useCallback(
    (rowIndex: number) => {
      const row = participants[rowIndex];

      if (!row || !row.fromStage) {
        return <Cell></Cell>;
      }

      return (
        <Cell
          className={classNames({
            [styles["from-another-tournament"]]: !!row.fromStage,
          })}
        >
          {`${_getTournamentTitle(
            season,
            row.fromStage.tournamentSeason.tournament,
            false,
            true
          )}: ${getStageLabel(row.fromStage.stageType)}`}
        </Cell>
      );
    },
    [participants, season]
  );

  const toolsCellRenderer = useCallback(
    (rowIndex: number) => {
      const row = participants[rowIndex];

      const onConfirmClick = () => {
        if (adding) {
          return addNewParticipant();
        }

        if (isNotEmpty(editingParticipantIdx)) {
          return onEditParticipant();
        }

        setEditingParticipantIdx(rowIndex);
        setEditingParticipant(row);
      };

      const onCrossClick = () => {
        if (adding && !row) {
          setAdding(false);
          setNewParticipantClub(null);
          setNewParticipantStartingStage(null);
        } else {
          if (editingParticipantIdx !== rowIndex) {
            deleteParticipant(row);
          } else {
            setEditingParticipantIdx(null);
            setEditingParticipant(null);
          }
        }
      };

      const isCondirmDisabled = () => {
        if (adding) {
          if (row) {
            return true;
          } else {
            return !(
              isNotEmpty(newParticipantClub?.id) &&
              isNotEmpty(newParticipantStartingStage)
            );
          }
        }

        if (row && isNotEmpty(editingParticipantIdx)) {
          return editingParticipantIdx !== rowIndex;
        }

        return false;
      };

      const isCrossDisabled = () => {
        if (adding) {
          return !!row;
        }

        if (row && isNotEmpty(editingParticipantIdx)) {
          return editingParticipantIdx !== rowIndex;
        }

        return false;
      };

      return (
        <Cell className={styles["tools-cell"]}>
          <Button
            icon={
              editingParticipantIdx === rowIndex || adding ? "confirm" : "edit"
            }
            onClick={onConfirmClick}
            small
            minimal
            className={styles["edit-button"]}
            disabled={isCondirmDisabled()}
          />
          <Button
            icon={row && editingParticipantIdx !== rowIndex ? "trash" : "cross"}
            small
            minimal
            onClick={onCrossClick}
            disabled={isCrossDisabled()}
          />
        </Cell>
      );
    },
    [
      participants,
      editingParticipantIdx,
      adding,
      addNewParticipant,
      newParticipantClub?.id,
      newParticipantStartingStage,
      onEditParticipant,
      deleteParticipant,
    ]
  );

  const renderColumns = useCallback(
    () =>
      [
        { key: 0, name: "Країна", cellRenderer: countryCellRenderer },
        { key: 1, name: "Клуб", cellRenderer: clubCellRenderer },
        { key: 2, name: "Старт", cellRenderer: startCellRenderer },
        ...(shouldShowFromColumn
          ? [{ key: 3, name: "Перейшов з", cellRenderer: fromCellRenderer }]
          : []),
        ...(user?.isEditor
          ? [{ key: 4, name: "", cellRenderer: toolsCellRenderer }]
          : []),
      ].map(({ key, name, cellRenderer }) => (
        <Column key={key} name={name} cellRenderer={cellRenderer} />
      )),
    [
      clubCellRenderer,
      countryCellRenderer,
      fromCellRenderer,
      shouldShowFromColumn,
      startCellRenderer,
      toolsCellRenderer,
      user?.isEditor,
    ]
  );

  useEffect(() => {
    if (participants.length > 0) {
      setIndexMap(participants.map(({ id }) => id));
    }
  }, [participants, participants.length]);

  return (
    <div className={styles["participants-table"]}>
      <Table2
        numRows={adding ? participants.length + 1 : participants.length}
        enableFocusedCell={false}
        cellRendererDependencies={[
          indexMap,
          newParticipantClub?.id,
          newParticipantStartingStage,
          editingParticipantIdx,
          editingParticipant?.club.id,
          editingParticipant?.startingStage,
        ]}
        columnWidths={columnWidths}
        rowHeights={new Array(
          adding ? participants.length + 1 : participants.length
        ).fill(TABLE_ROW_HEIGHT)}
      >
        {renderColumns()}
      </Table2>
      {user?.isEditor && (
        <Button
          icon="plus"
          small
          onClick={() => setAdding(true)}
          className={styles["participants-table-button"]}
          disabled={editingParticipantIdx !== null || adding}
        />
      )}
    </div>
  );
};

export { ParticipantsTable };
