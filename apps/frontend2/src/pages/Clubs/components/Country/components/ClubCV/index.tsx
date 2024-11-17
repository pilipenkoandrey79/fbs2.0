import { FC } from "react";
import { Divider, Flex, Skeleton, Timeline, Typography } from "antd";
import { Years } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import { getCVBalance } from "@fbs2.0/utils";

import { Club } from "../../../../../../components/Club";
import { CVItem } from "./components/CVItem";
import { useGetClubCV } from "../../../../../../react-query-hooks/club/useGetClubCV";
import { useGetClub } from "../../../../../../react-query-hooks/club/useGetClub";
import { Balance } from "../../../../../../components/Balance";

import styles from "./styles.module.scss";

interface Props {
  id: number | undefined;
}

const ClubCV: FC<Props> = ({ id }) => {
  const { t } = useTranslation();
  const club = useGetClub(id);
  const cv = useGetClubCV(id);
  const { balance, matches } = getCVBalance(cv.data);

  return cv.isLoading || club.isLoading ? (
    <Skeleton active />
  ) : (
    <div className={styles.cv}>
      <Typography.Title level={3}>
        {t("clubs.club.club_cv.title")}{" "}
        {club.data && (
          <Club
            club={club.data}
            showCity={false}
            showCountry={false}
            className={styles.club}
          />
        )}
      </Typography.Title>
      <Flex vertical gap={12}>
        <Flex gap={6} align="center">
          <Typography.Text>{t("clubs.club.club_cv.matches")}:</Typography.Text>
          <Typography.Text>{matches}</Typography.Text>
        </Flex>
        <Flex gap={6} align="center">
          <Typography.Text>{t("clubs.club.club_cv.titles")}:</Typography.Text>
          <Typography.Text>
            {cv.data?.reduce<number>(
              (acc, { isWinner }) => acc + (isWinner ? 1 : 0),
              0
            )}
          </Typography.Text>
        </Flex>
        <Flex gap={6} align="center">
          <Typography.Text>{t("clubs.club.club_cv.balance")}:</Typography.Text>
          <Balance balance={balance} />
        </Flex>
      </Flex>
      <Divider />
      <Timeline
        mode="right"
        className={styles.timeline}
        items={new Array(new Date().getFullYear() - Years.GLOBAL_START + 1)
          .fill(1)
          .map((_, index) => {
            const start = Years.GLOBAL_START + index;
            const finish = Years.GLOBAL_START + index + 1;

            const tournamentSeasons =
              cv.data?.filter(
                ({ tournamentSeason }) =>
                  tournamentSeason.season === [start, finish].join("-")
              ) || [];

            return {
              key: index,
              label: (
                <Flex gap={2} className={styles.label} align="center">
                  <span className={styles.start}>{start}</span>
                  <span>-</span>
                  <span className={styles.finish}>{finish}</span>
                </Flex>
              ),
              children: tournamentSeasons?.length > 0 && (
                <CVItem entries={tournamentSeasons} />
              ),
            };
          })}
      />
    </div>
  );
};

export { ClubCV };
