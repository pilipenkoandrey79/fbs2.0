import { FC, useCallback, useContext, useMemo, useState } from "react";
import { Button, Popover, Tooltip } from "@blueprintjs/core";
import { Cell, Column, Table2 } from "@blueprintjs/table";
import classNames from "classnames";
import {
  TABLE_ROW_HEIGHT,
  Group as GroupName,
  Participant,
  GroupRow,
  ChessCell,
  UKRAINE,
  USSR,
  StageScheme,
  StageSchemeType,
  Tournament,
  Stage,
} from "@fbs2.0/types";
import { isNotEmpty, getNumGroupRows } from "@fbs2.0/utils";
import { DateTime } from "luxon";

import { UserContext } from "../../../../../../context/userContext";
import { Club } from "../../../../../../components/Club";
import { GroupMatchForm } from "../GroupMatchForm";
import { GroupMatchCombination } from "../../../../types";
import {
  getGroupWinnersQuantity,
  playedMatchesOfGroup,
} from "../../../../utils";

import styles from "./styles.module.scss";

const isWinner = (stageSchemeType: StageSchemeType, index: number) =>
  index < getGroupWinnersQuantity(stageSchemeType);

export interface ColorClasses {
  club: string;
  divider: string;
}

interface Props {
  name: GroupName;
  stage: Stage;
  season: string;
  tableRows: GroupRow[];
  version: number;
  className?: string;
  colorClasses: ColorClasses;
  stageParticipants: Participant[];
  isFinished: boolean;
  stageScheme: StageScheme;
  hasLinkedTournanent: boolean;
  highlightedClubId?: number;
  tournament: Tournament;
}

const Group: FC<Props> = ({
  name,
  tableRows,
  season,
  className,
  colorClasses,
  version,
  stageParticipants,
  isFinished,
  stageScheme,
  hasLinkedTournanent,
  stage,
  highlightedClubId,
  tournament,
}) => {
  const numRows = getNumGroupRows(stageScheme.type);

  const { user } = useContext(UserContext);

  const [adding, setAdding] = useState(false);
  const [editedMatchId, setEditedMatchId] = useState<number | null>(null);

  const playedMatches = useMemo(
    () => playedMatchesOfGroup(tableRows),
    [tableRows]
  );

  const participants = useMemo(
    () =>
      tableRows.length < numRows
        ? numRows % 2 > 0 && numRows - tableRows.length === 1
          ? [...tableRows.map(({ team }) => team), ...stageParticipants]
          : stageParticipants
        : tableRows.map(({ team }) => team),
    [numRows, stageParticipants, tableRows]
  );

  const availableCombinations = useMemo(() => {
    if (tableRows.length < numRows) {
      return [];
    }

    const possibleCombinations = participants.reduce<GroupMatchCombination[]>(
      (acc, participant, index) => {
        participants.forEach((rival, rivalIndex) => {
          if (index === rivalIndex) {
            return;
          }

          acc.push({ host: participant, guest: rival });
        });

        return acc;
      },
      []
    );

    return possibleCombinations.filter(
      ({ host: { id: hostId }, guest: { id: guestId } }) =>
        !playedMatches.find((match) => {
          const { host, guest } = { ...match };

          return host?.id === hostId && guest?.id === guestId;
        })
    );
  }, [tableRows.length, numRows, participants, playedMatches]);

  const toursRange = useMemo(() => {
    const tours = [1, 2, 3, 4, 5, 6].filter(
      (tour) => playedMatches.filter((match) => match?.tour === tour).length < 2
    );

    return [tours[0], tours[tours.length - 1]];
  }, [playedMatches]);

  const defaultDate = useMemo(() => {
    const date = playedMatches.find(
      (match) => match?.tour === toursRange[0]
    )?.date;

    if (date) {
      return date;
    }

    const previousTourDate = playedMatches.find(
      (match) => match?.tour === toursRange[0] - 1
    )?.date;

    if (previousTourDate) {
      return previousTourDate;
    }

    return (
      DateTime.fromObject({
        year: parseInt(season.split("-")[0]),
        month: 9,
        day: 1,
      }).toISODate() || ""
    );
  }, [playedMatches, season, toursRange]);

  const clubCellRenderer = useCallback(
    (rowIndex: number) => (
      <Cell
        className={classNames(colorClasses.club, {
          [styles.winner]: isWinner(stageScheme.type, rowIndex),
          [styles.promoted]: hasLinkedTournanent && rowIndex === 2,
          [styles.mine]: [UKRAINE, USSR].includes(
            tableRows[rowIndex]?.team?.club.city.country.name
          ),
          [styles[`highlighted-${tournament}`]]:
            tableRows[rowIndex]?.team?.club.id === highlightedClubId,
        })}
      >
        <Club club={tableRows[rowIndex]?.team?.club} />
      </Cell>
    ),
    [
      colorClasses.club,
      hasLinkedTournanent,
      highlightedClubId,
      stageScheme.type,
      tableRows,
      tournament,
    ]
  );

  const resultCellRenderer = useCallback(
    (rowIndex: number, columnIndex: number) => {
      const { label, date, match } =
        tableRows[rowIndex]?.chessCells?.[columnIndex - 1] || ({} as ChessCell);

      const divider = rowIndex === columnIndex - 1;
      const isOpen = editedMatchId === match?.id;
      const closeEditingPopover = () => setEditedMatchId(null);

      return (
        <Cell
          className={classNames({
            [colorClasses.divider]: divider,
            [styles["result-cell"]]: !divider,
          })}
        >
          {isNotEmpty(label, true) && (
            <>
              <Tooltip content={date}>{label}</Tooltip>
              {!divider && user?.isEditor && (
                <div className={styles["button-wrapper"]}>
                  <Popover
                    isOpen={isOpen}
                    content={
                      <div className={styles["popover-content"]}>
                        <Button
                          icon="cross"
                          small
                          minimal
                          onClick={closeEditingPopover}
                          className={styles["popover-close-button"]}
                        />
                        <GroupMatchForm
                          saveCallback={closeEditingPopover}
                          participants={participants}
                          name={name}
                          match={match ?? undefined}
                          stage={stage}
                        />
                      </div>
                    }
                    hasBackdrop
                    placement="bottom-end"
                    minimal
                  >
                    <Button
                      icon="edit"
                      onClick={() => setEditedMatchId(match?.id ?? null)}
                      small
                      minimal
                      className={classNames(styles["edit-result-button"], {
                        [styles["is-open"]]: isOpen,
                      })}
                    />
                  </Popover>
                </div>
              )}
            </>
          )}
        </Cell>
      );
    },
    [
      colorClasses.divider,
      editedMatchId,
      name,
      participants,
      stage,
      tableRows,
      user?.isEditor,
    ]
  );

  const scoreCellRenderer = useCallback(
    (
        field: keyof Pick<
          GroupRow,
          "defeat" | "draw" | "games" | "score" | "win"
        >
      ) =>
      (rowIndex: number) =>
        (
          <Cell>
            {tableRows[rowIndex]?.[field]}
            {field === "score"
              ? tableRows[rowIndex]?.results?.some(
                  ({ hasDeductedPoints, tech }) => !!hasDeductedPoints || !!tech
                )
                ? "*"
                : ""
              : ""}
          </Cell>
        ),
    [tableRows]
  );

  const goalsCellRenderer = useCallback(
    (rowIndex: number) => (
      <Cell>{tableRows[rowIndex]?.goals?.join(" - ")}</Cell>
    ),
    [tableRows]
  );

  const close = () => setAdding(false);

  const renderColumns = useCallback(() => {
    const columns = [
      <Column key="t" name="" cellRenderer={clubCellRenderer} />,
    ];

    const chessColumns = new Array(numRows)
      .fill(1)
      .map((_, index) => (
        <Column key={index + 1} name="" cellRenderer={resultCellRenderer} />
      ));

    const infoColumns = [
      <Column key="m" name="І" cellRenderer={scoreCellRenderer("games")} />,
      <Column key="w" name="В" cellRenderer={scoreCellRenderer("win")} />,
      <Column key="d" name="Н" cellRenderer={scoreCellRenderer("draw")} />,
      <Column key="l" name="П" cellRenderer={scoreCellRenderer("defeat")} />,
      <Column key="g" name="М" cellRenderer={goalsCellRenderer} />,
      <Column key="s" name="О" cellRenderer={scoreCellRenderer("score")} />,
    ];

    return columns.concat(chessColumns, infoColumns);
  }, [
    clubCellRenderer,
    goalsCellRenderer,
    numRows,
    resultCellRenderer,
    scoreCellRenderer,
  ]);

  return (
    <div className={classNames(styles.group, className)}>
      <h4>{`Группа ${name}`}</h4>
      <div>
        <Table2
          numRows={numRows}
          columnWidths={[
            150,
            ...new Array(numRows).fill(40),
            32,
            32,
            32,
            32,
            60,
            40,
          ]}
          rowHeights={new Array(numRows).fill(TABLE_ROW_HEIGHT)}
          cellRendererDependencies={[
            version,
            editedMatchId,
            user?.isEditor,
            highlightedClubId,
          ]}
        >
          {renderColumns()}
        </Table2>
        {user?.isEditor && !isFinished && (
          <Popover
            isOpen={adding}
            content={
              <div className={styles["popover-content"]}>
                <Button
                  icon="cross"
                  small
                  minimal
                  onClick={close}
                  className={styles["popover-close-button"]}
                />
                <GroupMatchForm
                  saveCallback={close}
                  participants={participants}
                  name={name}
                  toursRange={toursRange}
                  defaultDate={defaultDate}
                  availableCombinations={
                    numRows % 2 > 0 ? undefined : availableCombinations
                  }
                  stage={stage}
                />
              </div>
            }
            hasBackdrop
            placement="bottom-start"
            minimal
          >
            <Button icon="plus" small onClick={() => setAdding(true)} />
          </Popover>
        )}
      </div>
    </div>
  );
};

export { Group };
