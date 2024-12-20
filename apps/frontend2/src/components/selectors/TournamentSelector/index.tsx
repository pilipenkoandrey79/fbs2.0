import { Tournament, Years } from "@fbs2.0/types";
import { getTournamentTitle } from "@fbs2.0/utils";
import { Form, Segmented, SegmentedProps } from "antd";
import { FC } from "react";
import { useTranslation } from "react-i18next";

import { useGetTournamentSeasons } from "../../../react-query-hooks/tournament/useGetTournamentSeasons";

interface Props {
  startOfSeason: number | undefined;
  name?: string | (string | number)[];
  className?: string;
  existenceValidation?: boolean;
  exclude?: Tournament[];
}

const TournamentSelector: FC<Props> = ({
  startOfSeason,
  name = "tournament",
  className,
  existenceValidation = true,
  exclude,
}) => {
  const { t } = useTranslation();

  const { data: availableTournaments } = useGetTournamentSeasons();

  const options: SegmentedProps["options"] = Object.values(Tournament)
    .filter((tournament) => {
      if (startOfSeason === 0) {
        return true;
      }

      switch (tournament) {
        case Tournament.CUP_WINNERS_CUP:
          return (
            Number(startOfSeason) >= Years.START_OF_CWC &&
            Number(startOfSeason) <= Years.END_OF_CWC
          );
        case Tournament.FAIRS_CUP:
          return Number(startOfSeason) <= Years.END_OF_ICFC;
        case Tournament.EUROPE_LEAGUE:
          return Number(startOfSeason) >= Years.END_OF_ICFC + 1;
        case Tournament.EUROPE_CONFERENCE_LEAGUE:
          return Number(startOfSeason) >= Years.START_OF_UECL;
        default:
          return true;
      }
    })
    .filter((tournament) => !(exclude || []).includes(tournament))
    .map((tournament) => ({
      value: tournament,
      label: t(getTournamentTitle({ tournament, season: `${startOfSeason}-` })),
    }));

  const baseRule = { required: true, message: "" };

  return (
    <Form.Item
      name={name}
      className={className}
      dependencies={["start", "end"]}
      rules={
        existenceValidation
          ? [
              baseRule,
              ({ getFieldValue }) => ({
                validator: (_, tournament: Tournament) =>
                  availableTournaments?.[
                    [getFieldValue("start"), getFieldValue("end")].join("-")
                  ]?.find(({ type }) => type === tournament)
                    ? Promise.reject(new Error(t("home.tournament.existed")))
                    : Promise.resolve(),
              }),
            ]
          : [baseRule]
      }
    >
      <Segmented options={options} />
    </Form.Item>
  );
};

export { TournamentSelector };
