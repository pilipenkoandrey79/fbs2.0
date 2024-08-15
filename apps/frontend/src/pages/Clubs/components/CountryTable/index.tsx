import { Club } from "@fbs2.0/types";
import { FC } from "react";
import classNames from "classnames";
import { Classes } from "@blueprintjs/core";

import { CityLabel } from "./components/CityLabel";
import { ClubLabel } from "./components/ClubLabel";
import { ClubsTreeItem } from "../../prepareTree";

interface Props {
  country: ClubsTreeItem;
  onSelect: (club: Club) => void;
}

const CountryTable: FC<Props> = ({ country, onSelect }) => (
  <table className={classNames(Classes.HTML_TABLE, Classes.COMPACT)}>
    <thead>
      <tr>
        <th>Місто</th>
        <th>Клуби</th>
      </tr>
    </thead>
    <tbody>
      {country.cities.map((city) => (
        <tr key={city.city.id}>
          <td>
            <CityLabel city={city.city} removable={city.clubs.length === 0} />
          </td>
          <td>
            {city.clubs.map((club) => (
              <ClubLabel
                key={club.id}
                club={club}
                onSelect={() => onSelect(club)}
              />
            ))}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export { CountryTable };
