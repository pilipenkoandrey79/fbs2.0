import { FC } from "react";
import { Divider, Flex, Skeleton, Timeline, Typography } from "antd";
import { FIRST_ICFC_SEASONS, Years } from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import { getCVBalance } from "@fbs2.0/utils";
import { CarryOutOutlined, TrophyTwoTone } from "@ant-design/icons";
import classNames from "classnames";

import { Club } from "../../../../../../components/Club";
import { CVItem } from "./components/CVItem";
import { Balance } from "../../../../../../components/Balance";
import { useGetClubCV } from "../../../../../../react-query-hooks/club/useGetClubCV";
import { useGetClub } from "../../../../../../react-query-hooks/club/useGetClub";

import styles from "./styles.module.scss";
import colors from "../../../../../../style/colors.module.scss";

interface Props {
  id: number | undefined;
  till?: string | null;
}

const ClubCV: FC<Props> = ({ id, till }) => {
  const { t } = useTranslation();
  const club = useGetClub(id);
  const cv = useGetClubCV(id, till ?? "");
  const { balance, matches } = getCVBalance(cv.data);

  return cv.isLoading || club.isLoading ? (
    <Skeleton active />
  ) : (
    <div className={styles.cv}>
      <Flex justify="space-between">
        <div>
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
          <Flex gap={8} className={styles.titles}>
            <TrophyTwoTone twoToneColor={colors.golden} />
            <span>
              {cv.data?.reduce<number>(
                (acc, { isWinner }) => acc + (isWinner ? 1 : 0),
                0,
              )}
            </span>
          </Flex>
          <Flex gap={8} className={styles.matches}>
            <CarryOutOutlined />
            <span>{matches}</span>
          </Flex>
        </div>
        <Balance balance={balance} />
      </Flex>
      <Divider />
      <Timeline
        mode="right"
        className={styles.timeline}
        items={new Array(
          (till ? Number(till) : new Date().getFullYear()) -
            Years.GLOBAL_START +
            1,
        )
          .fill(1)
          .map((_, index) => {
            const start = Years.GLOBAL_START + index;
            const finish = Years.GLOBAL_START + index + 1;

            const additionalLabel = FIRST_ICFC_SEASONS.find(
              (item) => `${finish}` === item.split("-")[1],
            );

            const labels = additionalLabel
              ? [additionalLabel.split("-"), [start, finish]]
              : [[start, finish]];

            const tournamentSeasons =
              cv.data?.filter(({ tournamentSeason }) => {
                const season = tournamentSeason.season.split("-");

                return `${finish}` === season[1];
              }) || [];

            return {
              key: index,
              label: (
                <div className={styles["label-wrapper"]}>
                  {labels.map((label) => (
                    <Flex
                      gap={2}
                      className={styles.label}
                      align="center"
                      key={label[0]}
                    >
                      <span className={styles.start}>{label[0]}</span>
                      <span>-</span>
                      <span className={styles.finish}>{label[1]}</span>
                    </Flex>
                  ))}
                </div>
              ),
              children:
                tournamentSeasons?.length > 0 ? (
                  <CVItem entries={tournamentSeasons} clubId={club.data?.id} />
                ) : (
                  <div
                    className={classNames(styles.placeholder, {
                      [styles.special]: additionalLabel,
                    })}
                  ></div>
                ),
            };
          })}
      />
    </div>
  );
};

export { ClubCV };
