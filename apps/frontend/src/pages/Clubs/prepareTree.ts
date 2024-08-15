import { City, Club, Country } from "@fbs2.0/types";

export interface ClubsTreeItem {
  country: Country;
  cities: {
    city: City;
    clubs: Club[];
  }[];
}

export const prepareTree = (
  clubs: Club[] | undefined,
  citiesWithoutClubs: City[],
  oldCountries: Country[]
) =>
  clubs
    ?.reduce<ClubsTreeItem[]>((acc, club) => {
      const { city } = club;
      const { country } = city;

      const countryIdx = acc.findIndex(
        (item) => item.country.id === country.id
      );

      if (countryIdx >= 0) {
        const cityIdx = acc[countryIdx].cities.findIndex(
          (item) => item.city.id === city.id
        );

        if (cityIdx >= 0) {
          acc[countryIdx].cities[cityIdx].clubs.push(club);
        } else {
          acc[countryIdx].cities.push({ city, clubs: [club] });
        }
      } else {
        acc.push({
          country,
          cities: [
            { city, clubs: [club] },
            ...citiesWithoutClubs
              .filter(({ country: { id } }) => country.id === id)
              .map((city) => ({ city, clubs: [] })),
          ],
        });
      }

      return acc;
    }, [])
    .sort((a, b) => {
      const collator = new Intl.Collator("uk");

      return collator.compare(a.country.name, b.country.name);
    })
    .map((country) => ({
      ...country,
      cities: [...(country.cities || [])].sort((a, b) => {
        const collator = new Intl.Collator("uk");

        return collator.compare(a.city.name, b.city.name);
      }),
    }))
    .concat(oldCountries.map((country) => ({ country, cities: [] })));
