import {
  Club as ClubInterface,
  StageType,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
} from "@fbs2.0/types";
import { FC } from "react";
import { getCVBalance, _getStageLabel } from "@fbs2.0/utils";
import classNames from "classnames";
import { Classes } from "@blueprintjs/core";

import { LoadOrError } from "../../../../components/LoadOrError";
import { Balance } from "../../../../components/Balance";
import { Club } from "../../../../components/Club";
import { TournamentBadge } from "../../../../components/TournamentBadge";
import { useClubCV } from "../../../../react-query-hooks/club/useClubCV";

import styles from "./styles.module.scss";

interface Props {
  club: ClubInterface;
}

const ClubCV: FC<Props> = ({ club }) => {
  const { data: cv, error, isLoading } = useClubCV(club.id);
  const { balance, matches } = getCVBalance(cv);

  const titles = cv?.reduce<number>(
    (acc, { isWinner }) => acc + (isWinner ? 1 : 0),
    0
  );

  return (
    <LoadOrError loading={isLoading} error={error}>
      <div className={styles.header}>
        <h2>
          <Club club={club} />
        </h2>
      </div>
      <div className={styles.balance}>
        <p>
          Всього матчів: <span className={styles.value}>{matches}</span>
        </p>
        <p>
          Баланс: <Balance balance={balance} />
        </p>
        <p>
          Титулів: <span className={styles.value}>{titles || "-"}</span>
        </p>
      </div>
      <div className={styles.cv}>
        <table
          className={classNames(
            Classes.HTML_TABLE,
            Classes.COMPACT,
            Classes.HTML_TABLE_BORDERED,
            Classes.HTML_TABLE_STRIPED
          )}
        >
          <thead>
            <tr>
              <th>Сезон</th>
              <th>Турнір</th>
              <th>Старт</th>
              <th>Фініш</th>
            </tr>
          </thead>
          <tbody>
            {cv?.map(
              ({
                tournamentSeason: { tournament, season, id },
                finish,
                start,
                isWinner,
              }) => (
                <tr
                  key={id}
                  className={classNames({
                    [styles.winner]: isWinner,
                    [styles.final]: finish === StageType.FINAL && !isWinner,
                  })}
                >
                  <td>{season}</td>
                  <td>
                    <TournamentBadge
                      tournamentSeason={{ tournament, season, id }}
                      linkTo={`/tournaments/${season}/${tournament}?${HIGHLIGHTED_CLUB_ID_SEARCH_PARAM}=${club.id}`}
                    />
                  </td>
                  <td>{_getStageLabel(start)}</td>
                  <td>
                    {isWinner ? "Переможець турніру" : _getStageLabel(finish)}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </LoadOrError>
  );
};

export { ClubCV };
