import { FC } from "react";
import {
  Divider,
  Flex,
  Skeleton,
  Table,
  TableProps,
  Tooltip,
  Typography,
} from "antd";
import { CalendarOutlined, TrophyTwoTone } from "@ant-design/icons";
import {
  CountryCVStatus,
  CountryCV as CountryCVInterface,
  Club as ClubInterface,
  HIGHLIGHTED_CLUB_ID_SEARCH_PARAM,
} from "@fbs2.0/types";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { createSearchParams, generatePath, Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

import { Club } from "../../../../../../components/Club";
import { TournamentBadge } from "../../../../../../components/TournamentBadge";
import { useGetCountryCV } from "../../../../../../react-query-hooks/country/useGetCountryCV";
import { Paths } from "../../../../../../routes";

import styles from "./styles.module.scss";
import colors from "../../../../../../style/colors.module.scss";
import variables from "../../../../../../style/variables.module.scss";

interface Props {
  id: number | undefined;
}

const CountryCV: FC<Props> = ({ id }) => {
  const { t } = useTranslation();
  const cv = useGetCountryCV(id);

  const isLgScreen = useMediaQuery({
    query: `(min-width: ${variables.screenLg})`,
  });

  const columns: TableProps<CountryCVInterface>["columns"] = [
    {
      key: "season",
      title: t("clubs.country_cv.columns.season"),
      dataIndex: "tournamentSeason",
      className: styles.season,
      width: 40,
      render: ({ season }) => {
        if (isLgScreen) {
          return season;
        }

        const parts = season.split("-");

        return [parts[0], parts[1].slice(2)].join("-");
      },
    },
    {
      key: "tournament",
      title: isLgScreen && t("clubs.country_cv.columns.tournament"),
      dataIndex: "tournamentSeason",
      className: styles.tournament,
      width: 50,
      render: (value) => <TournamentBadge tournamentSeason={value} />,
    },
    {
      key: "status",
      title: t("clubs.country_cv.columns.status"),
      dataIndex: "status",
      width: 60,
      ellipsis: true,
      render: (value) =>
        value === CountryCVStatus.Both ? (
          <Flex vertical>
            <Typography.Text ellipsis className={styles.winner}>
              {t("clubs.country_cv.winner")}
            </Typography.Text>
            <Typography.Text ellipsis className={styles["runner-up"]}>
              {t("clubs.country_cv.runner-up")}
            </Typography.Text>
          </Flex>
        ) : (
          <Typography.Text
            ellipsis
            className={classNames({
              [styles["runner-up"]]: value === CountryCVStatus.RunnerUp,
              [styles.winner]: value === CountryCVStatus.Winner,
            })}
          >
            {t(`clubs.country_cv.${value}`)}
          </Typography.Text>
        ),
    },
    {
      key: "club",
      title: t("clubs.country_cv.columns.club"),
      width: 100,
      ellipsis: true,
      render: (_, { status, host, guest, tournamentSeason }) => {
        const clubs = [host, guest].reduce<ClubInterface[]>((acc, club) => {
          acc[club.isWinner ? 0 : 1] = club.club;

          return acc;
        }, []);

        switch (status) {
          case CountryCVStatus.Winner:
            delete clubs[1];
            break;
          case CountryCVStatus.RunnerUp:
            delete clubs[0];
            break;
        }

        return (
          <Flex vertical>
            {clubs.map((club, index) => (
              <Link
                to={
                  generatePath(Paths.TOURNAMENT, tournamentSeason) +
                  `?${createSearchParams([
                    [HIGHLIGHTED_CLUB_ID_SEARCH_PARAM, `${club.id}`],
                  ])}`
                }
              >
                <Club
                  club={club}
                  showCountry={false}
                  className={classNames(
                    clubs.length > 1
                      ? index
                        ? styles["runner-up"]
                        : styles.winner
                      : status === CountryCVStatus.Winner
                      ? styles.winner
                      : styles["runner-up"]
                  )}
                />
              </Link>
            ))}
          </Flex>
        );
      },
    },
  ];

  return cv.isLoading ? (
    <Skeleton active />
  ) : (
    <div className={styles.cv}>
      <Flex gap={8} className={styles.titles}>
        <Tooltip title={t("clubs.country_cv.finals")}>
          <CalendarOutlined />
        </Tooltip>
        <span>{cv.data?.length || 0}</span>
        <Tooltip title={t("clubs.country_cv.titles")}>
          <TrophyTwoTone twoToneColor={colors.golden} />
        </Tooltip>
        <span>
          {cv.data?.reduce<number>(
            (acc, { status }) =>
              acc + (status === CountryCVStatus.RunnerUp ? 0 : 1),
            0
          )}
        </span>
      </Flex>
      <Divider />
      <div className={styles.table}>
        <Table<CountryCVInterface>
          columns={columns}
          dataSource={cv.data ?? []}
          rowKey={(record) => record.tournamentSeason.id}
          size="small"
          pagination={false}
          bordered
          loading={cv.isLoading}
        />
      </div>
    </div>
  );
};

export { CountryCV };
