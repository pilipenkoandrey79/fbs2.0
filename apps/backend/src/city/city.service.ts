import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { _OldCityNameDto } from "@fbs2.0/types";

import { Country } from "../country/entities/country.entity";
import { City } from "./entities/city.entity";
import { OldCityName } from "./entities/old-city-name.entity";
import { _CreateCityDto } from "./entities/city.dto";

@Injectable()
export class CityService {
  @InjectRepository(Country)
  private readonly countryRepository: Repository<Country>;

  @InjectRepository(City)
  private readonly cityRepository: Repository<City>;

  @InjectRepository(OldCityName)
  private readonly cityOldNameRepository: Repository<OldCityName>;

  public async getCities(withoutClubs: boolean): Promise<City[]> {
    const cities = await this.cityRepository.find({
      relations: { country: true, oldNames: true, clubs: !!withoutClubs },
      order: { name: "ASC" },
    });

    if (!withoutClubs) {
      return cities;
    }

    return cities.filter(({ clubs }) => clubs.length < 1);
  }

  public async createCityOldName(
    cityId: number,
    body: _OldCityNameDto
  ): Promise<OldCityName> {
    const city = await this.cityRepository.findOne({ where: { id: cityId } });

    const country = await this.countryRepository.findOne({
      where: { id: body.countryId },
    });

    const cityOldName = new OldCityName();

    cityOldName.city = city;
    cityOldName.name = body.name;
    cityOldName.country = country;
    cityOldName.till = body.till;

    return this.cityOldNameRepository.save(cityOldName);
  }

  public async removeCityOldName(cityOldNameId: number) {
    const cityOldName = await this.cityOldNameRepository.findOne({
      where: { id: cityOldNameId },
    });

    return this.cityOldNameRepository.remove(cityOldName);
  }

  public async _createCity(body: _CreateCityDto): Promise<City> {
    const city: City = new City();

    city.name = body.name;

    const country = await this.countryRepository.findOne({
      where: { id: body.countryId },
    });

    city.country = country;

    return this.cityRepository.save(city);
  }

  public async _updateCity(cityId: number, body: City): Promise<City> {
    const city = await this.cityRepository.findOne({ where: { id: cityId } });

    const country = await this.countryRepository.findOne({
      where: { id: body.country.id },
    });

    city.name = body.name;
    city.country = country;

    return this.cityRepository.save(city);
  }

  public async removeCity(cityId: number) {
    const city = await this.cityRepository.findOne({ where: { id: cityId } });

    if (!city) {
      throw new NotFoundException();
    }

    return await this.cityRepository.remove(city);
  }
}
