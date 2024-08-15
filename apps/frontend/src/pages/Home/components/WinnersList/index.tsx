import { Button, Classes, Drawer, Switch } from "@blueprintjs/core";
import {
  AvailableTournaments,
  Club as ClubInterface,
  Country,
} from "@fbs2.0/types";
import classNames from "classnames";
import { FC, useMemo, useState } from "react";

import { Club } from "../../../../components/Club";
import { Flag } from "../../../../components/Flag";

interface ListItem {
  item: ClubInterface | Country;
  year: number;
}

interface Props {
  seasons: string[];
  availableTournaments: AvailableTournaments;
}

const WinnersList: FC<Props> = ({ seasons, availableTournaments }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFinalists, setShowFinalists] = useState(false);
  const [byCountries, setByCountries] = useState(false);

  const list = useMemo(
    () =>
      seasons
        .reduce<ListItem[]>((acc, season) => {
          const tournaments = availableTournaments[season];
          const end = Number(season.split("-")[1]);

          tournaments.forEach(({ winner, finalist }) => {
            const isExistAsWinner = acc.find(
              ({ item }) =>
                item?.id ===
                (byCountries ? winner?.club.city.country.id : winner?.club.id)
            );

            if (!isExistAsWinner) {
              acc.push({
                item: (byCountries
                  ? winner?.club.city.country
                  : winner?.club) as ClubInterface | Country,
                year: end,
              });
            }

            if (showFinalists) {
              const isExistAsFinalist = acc.find(
                ({ item }) =>
                  item?.id ===
                  (byCountries
                    ? finalist?.club.city.country.id
                    : finalist?.club.id)
              );

              if (!isExistAsFinalist) {
                acc.push({
                  item: (byCountries
                    ? finalist?.club.city.country
                    : finalist?.club) as ClubInterface | Country,
                  year: end,
                });
              }
            }
          });

          return acc;
        }, [])
        .sort((a, b) => a.year - b.year),
    [availableTournaments, byCountries, seasons, showFinalists]
  );

  return (
    <>
      <Button
        text="Список переможців та фіналістів"
        minimal
        onClick={() => setIsOpen(true)}
      />
      <Drawer
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
        icon="info-sign"
        title="Переможці та фіналісти"
        autoFocus
        hasBackdrop
        canOutsideClickClose={false}
        usePortal
      >
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>
            <Switch
              checked={byCountries}
              label="По країнах"
              onChange={() => setByCountries(!byCountries)}
            />
            <Switch
              checked={showFinalists}
              label="Фіналісти"
              onChange={() => setShowFinalists(!showFinalists)}
            />
            <table className={classNames(Classes.HTML_TABLE, Classes.COMPACT)}>
              <thead>
                <tr>
                  <th></th>
                  <th>
                    {showFinalists
                      ? "Рік першого фіналу"
                      : "Рік першого титулу"}
                  </th>
                  <th>{byCountries ? "Країна" : "Клуб"}</th>
                </tr>
              </thead>
              <tbody>
                {list.map(({ item, year }, index) =>
                  item ? (
                    <tr key={item?.id}>
                      <td>{index + 1}</td>
                      <td>{year}</td>
                      <td>
                        {byCountries ? (
                          <>
                            <Flag country={item as Country} />{" "}
                            <span>{item?.name}</span>
                          </>
                        ) : (
                          <Club club={item} />
                        )}
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export { WinnersList };
