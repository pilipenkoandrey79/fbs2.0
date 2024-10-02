import { FC, useCallback, useContext, useMemo, useState } from "react";
import { Cell, Column, Table2, TruncatedFormat } from "@blueprintjs/table";
import { Button, Intent, Popover } from "@blueprintjs/core";
import { isNotEmpty } from "@fbs2.0/utils";
import {
  ONE_MATCH_STAGES,
  Stage,
  _StageTableData,
  _StageTableRow,
  StageType,
  TABLE_ROW_HEIGHT,
  UKRAINE,
  USSR,
} from "@fbs2.0/types";
import classNames from "classnames";
import { DateTime } from "luxon";

import { UserContext } from "../../../../context/userContext";
import { Club } from "../../../../components/Club";
import { ResultForm } from "./components/ResultForm";
import { ParticipantSelector } from "../../../../components/selectors/ParticipantSelector";
import { StageProps } from "../../types";
import { getExistedParticipantsIds, getResultsInPair } from "../../utils";
import { useCreateMatch } from "../../../../react-query-hooks/matches/useCreateMatch";
import { useDeleteMatch } from "../../../../react-query-hooks/matches/useDeleteMatch";

import styles from "./styles.module.scss";

interface Props extends StageProps {
  stage: Stage;
  matches: _StageTableData;
  matchDay?: number;
}

const KnockoutStage: FC<Props> = ({
  stage,
  matches,
  participants: allParticipants,
  version,
  isRefetching,
  highlightedClubId,
  matchDay,
}) => {
  const { user } = useContext(UserContext);

  const [adding, setAdding] = useState(false);
  const [newResultMatchId, setNewResultMatchId] = useState<number | null>(null);
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [newHostId, setNewHostId] = useState<number | null>(null);
  const [newGuestId, setNewGuestId] = useState<number | null>(null);

  const { mutate: addMatch } = useCreateMatch((result) => {
    if (result) {
      setAdding(false);
      setNewHostId(null);
      setNewGuestId(null);
    }
  });

  const { mutate: deleteMatch } = useDeleteMatch();

  const numRows = adding ? matches.rows.length + 1 : matches.rows.length;
  const oneMatch = ONE_MATCH_STAGES.includes(stage.stageScheme.type);
  const replayInsteadOfPenalties = !stage.stageScheme.pen;
  const awayGoalRule = !!stage.stageScheme.awayGoal;

  const existedParticipantsIds = isNotEmpty(matchDay)
    ? getExistedParticipantsIds(matches)
    : [];

  const participants =
    existedParticipantsIds.length > 0
      ? allParticipants.filter(({ id }) => !existedParticipantsIds.includes(id))
      : allParticipants;

  const clubCellRenderer = (rowIndex: number, columnIndex: number) => {
    const accessor = columnIndex < 1 ? "host" : "guest";
    const match = matches.rows[rowIndex];

    const filteredParticipants = participants.filter(
      ({ id }) => id !== (columnIndex < 1 ? newGuestId : newHostId)
    );

    if (!match) {
      return (
        <Cell>
          <ParticipantSelector
            participants={filteredParticipants}
            onSelect={columnIndex < 1 ? setNewHostId : setNewGuestId}
            selectedItemId={
              (columnIndex < 1 ? newHostId : newGuestId) ?? undefined
            }
            className={styles["participant-selector"]}
            buttonClassName={styles["participant-selector-button"]}
          />
        </Cell>
      );
    }

    const { club, isWinner } = match[accessor] || ({} as _StageTableRow);

    return (
      <Cell
        truncated={false}
        className={classNames({
          [styles.winner]: isWinner,
          [styles.mine]: [UKRAINE, USSR].includes(club.city.country.name),
          [styles.relegated]: isNotEmpty(stage.linkedTournament) && !isWinner,
          [styles[`highlighted-${stage.tournamentSeason.tournament}`]]:
            club.id === highlightedClubId,
        })}
      >
        <Club club={club} />
      </Cell>
    );
  };

  const resultCellRenderer = (rowIndex: number, columnIndex: number) => {
    const match = matches.rows[rowIndex];
    const { result, anotherResult } = getResultsInPair(match, columnIndex);
    const date = matches.headers[columnIndex];
    const isOpen = `${match?.id}_${date}` === editingResultId;
    const close = () => setEditingResultId(null);

    const availableDates = matches.headers.filter((value) =>
      isNotEmpty(value, true)
    );

    return (
      <Cell truncated={false} className={styles["result-cell"]}>
        <TruncatedFormat detectTruncation={true}>
          {result?.label || ""}
        </TruncatedFormat>
        {user?.isEditor && (
          <div className={styles["button-wrapper"]}>
            {result && match && (
              <Popover
                isOpen={isOpen}
                content={
                  <div className={styles["popover-content"]}>
                    <Button
                      icon="cross"
                      small
                      minimal
                      onClick={close}
                      className={styles["popover-close-button"]}
                    />
                    <ResultForm
                      result={result}
                      host={match.host}
                      guest={match.guest}
                      date={date}
                      replayDate={match.replayDate}
                      matchId={match.id}
                      stage={stage}
                      saveCallback={close}
                      previousResult={anotherResult}
                      oneMatch={oneMatch}
                      replayInsteadOfPenalties={replayInsteadOfPenalties}
                      awayGoalRule={awayGoalRule}
                      forcedWinnerId={match.forceWinnerId ?? undefined}
                      availableDates={availableDates}
                    />
                  </div>
                }
                hasBackdrop
                placement="bottom-end"
                minimal
              >
                <Button
                  icon="edit"
                  onClick={() => setEditingResultId(`${match?.id}_${date}`)}
                  small
                  minimal
                  className={classNames(styles["edit-result-button"], {
                    [styles["is-open"]]: isOpen,
                  })}
                />
              </Popover>
            )}
          </div>
        )}
      </Cell>
    );
  };

  const toolsCellRenderer = (rowIndex: number) => {
    const match = matches.rows[rowIndex];
    const isOpen = match?.id === newResultMatchId;
    const results = match?.results.filter((item) => isNotEmpty(item)) || [];

    const canAddResult =
      isNotEmpty(match) &&
      !isNotEmpty(match.forceWinnerId) &&
      results.length <
        (ONE_MATCH_STAGES.includes(stage.stageScheme.type) ? 1 : 2);

    const availableDates = matches.headers.filter((value) =>
      isNotEmpty(value, true)
    );

    const initialDate =
      (availableDates[0]
        ? results[0]
          ? DateTime.fromISO(availableDates[0]).plus({ days: 6 }).toISODate()
          : availableDates[0]
        : DateTime.fromObject({
            year: parseInt(
              stage.tournamentSeason.season.split("-")[
                [
                  StageType.QUARTER_FINAL,
                  StageType.SEMI_FINAL,
                  StageType.FINAL,
                ].includes(stage.stageType)
                  ? 1
                  : 0
              ]
            ),
            month: [
              StageType.QUARTER_FINAL,
              StageType.SEMI_FINAL,
              StageType.FINAL,
            ].includes(stage.stageType)
              ? 3
              : 9,
            day: 1,
          }).toISODate()) || "";

    const close = () => setNewResultMatchId(null);

    return (
      <Cell className={styles["tools-cell"]}>
        {adding && rowIndex === numRows - 1 && (
          <Button
            icon="add"
            small
            onClick={addNewMatch}
            disabled={!(isNotEmpty(newHostId) && isNotEmpty(newGuestId))}
          />
        )}
        <Button
          icon={match ? "trash" : "cross"}
          intent={match ? Intent.DANGER : Intent.NONE}
          small
          minimal
          onClick={
            match
              ? () => deleteMatch({ match, onlyResults: false })
              : () => setAdding(false)
          }
          disabled={isRefetching}
        />
        {results.length > 0 && (
          <Button
            icon="graph-remove"
            intent={Intent.DANGER}
            small
            minimal
            disabled={isRefetching}
            onClick={() => clearResults(match)}
          />
        )}
        {canAddResult && (
          <Popover
            isOpen={isOpen}
            content={
              <div className={styles["popover-content"]}>
                <Button
                  icon="cross"
                  small
                  minimal
                  onClick={close}
                  className={styles["popover-close-button"]}
                  disabled={isRefetching}
                />
                <ResultForm
                  host={match?.host}
                  guest={match?.guest}
                  stage={stage}
                  initialDate={initialDate}
                  saveCallback={close}
                  previousResult={results[0]}
                  oneMatch={oneMatch}
                  replayInsteadOfPenalties={replayInsteadOfPenalties}
                  availableDates={availableDates}
                  awayGoalRule={awayGoalRule}
                />
              </div>
            }
            hasBackdrop
            placement="bottom-end"
            minimal
          >
            <Button
              icon="new-object"
              onClick={() => setNewResultMatchId(match?.id)}
              small
              minimal
              disabled={isRefetching}
            />
          </Popover>
        )}
      </Cell>
    );
  };

  const renderColumns = () => {
    const columns = matches.headers.map((name, index) =>
      index < 2 ? (
        <Column
          key={index === 0 ? "host" : "guest"}
          name={name}
          cellRenderer={clubCellRenderer}
        />
      ) : (
        <Column key={name} name={name} cellRenderer={resultCellRenderer} />
      )
    );

    if (user?.isEditor) {
      columns.push(
        <Column key="tools" name="" cellRenderer={toolsCellRenderer} />
      );
    }

    return columns;
  };

  const columnWidths = useMemo(() => {
    const widths: number[] = matches.headers.map((_, index) =>
      index < 2 ? 230 : 100
    );

    if (user?.isEditor) {
      widths.push(75);
    }

    return widths;
  }, [matches.headers, user?.isEditor]);

  const addNewMatch = useCallback(() => {
    if (newGuestId === null || newHostId === null) {
      return;
    }

    addMatch({
      tournament: stage.tournamentSeason.tournament,
      season: stage.tournamentSeason.season,
      matchDto: {
        hostId: newHostId,
        guestId: newGuestId,
        stageType: stage.stageType,
        answer: false,
        tour: matchDay ?? undefined,
      },
    });
  }, [
    addMatch,
    matchDay,
    newGuestId,
    newHostId,
    stage.stageType,
    stage.tournamentSeason.season,
    stage.tournamentSeason.tournament,
  ]);

  const clearResults = useCallback(
    (match: _StageTableRow) => {
      deleteMatch({ match, onlyResults: true });
    },
    [deleteMatch]
  );

  return (
    <>
      {isNotEmpty(matchDay) && <h3>{`Ігровий день ${matchDay}`}</h3>}
      {user?.isEditor && participants.length > 0 && (
        <Button
          icon="plus"
          small
          onClick={() => setAdding(true)}
          disabled={isRefetching || adding}
        />
      )}
      <Table2
        numRows={numRows}
        columnWidths={columnWidths}
        rowHeights={new Array(numRows).fill(TABLE_ROW_HEIGHT)}
        enableFocusedCell={false}
        cellRendererDependencies={[
          newGuestId,
          newHostId,
          newResultMatchId,
          editingResultId,
          highlightedClubId,
          version,
        ]}
        numFrozenColumns={2}
      >
        {renderColumns()}
      </Table2>
    </>
  );
};

export { KnockoutStage };
