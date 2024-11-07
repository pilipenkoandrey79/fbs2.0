import {
  Controller,
  Inject,
  Get,
  Param,
  ParseIntPipe,
  Body,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiEntities } from "@fbs2.0/types";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { UpdateCountryDto } from "../country/entities/country.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { Country } from "../country/entities/country.entity";
import { CountryCV } from "../country/entities/country-cv";
import { CountryService } from "./country.service";
import { City } from "../city/entities/city.entity";

@ApiTags(ApiEntities.Country)
@Controller(ApiEntities.Country)
export class CountryController {
  @Inject(CountryService)
  private readonly service: CountryService;

  @Get()
  @ApiOkResponse({ type: [Country] })
  public getCountries(): Promise<Country[]> {
    return this.service.getCountries();
  }

  @Get("/:id/cities")
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: [City] })
  public getCountryCities(
    @Param("id", ParseIntPipe) id: number
  ): Promise<City[]> {
    return this.service.getCountryCities(id);
  }

  @Get("/:id/cv")
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: [CountryCV] })
  public getCountryCV(
    @Param("id", ParseIntPipe) id: number
  ): Promise<CountryCV[]> {
    return this.service.getCountryCV(id);
  }

  @Put("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: Country })
  public updateCountry(@Body() body: UpdateCountryDto): Promise<Country> {
    return this.service.updateCountry(body);
  }
}
