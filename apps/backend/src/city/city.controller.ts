import {
  Controller,
  Inject,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Delete,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiEntities } from "@fbs2.0/types";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { City } from "./entities/city.entity";
import { CreateCityDto } from "./entities/city.dto";
import { CreateOldCityNameDTO } from "./entities/old-city-name.dto";
import { CityService } from "./city.service";

@ApiTags(ApiEntities.City)
@Controller(ApiEntities.City)
export class CityController {
  @Inject(CityService)
  private readonly service: CityService;

  @Get()
  @ApiOkResponse({ type: [City] })
  public getCities(
    @Query("withoutClubs") withoutClubs: boolean
  ): Promise<City[]> {
    return this.service.getCities(withoutClubs);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: City })
  public createCity(@Body() body: CreateCityDto): Promise<City> {
    return this.service.createCity(body);
  }

  @Put("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: City })
  public updateCity(
    @Param("id", ParseIntPipe) cityId: number,
    @Body() body: City
  ): Promise<City> {
    return this.service.updateCity(cityId, body);
  }

  @Delete("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteCity(@Param("id", ParseIntPipe) cityId: number) {
    return this.service.removeCity(cityId);
  }

  @Post("/:id/old-name")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiCreatedResponse({ type: CreateOldCityNameDTO })
  public createCityOldName(
    @Param("id", ParseIntPipe) cityId: number,
    @Body() body: CreateOldCityNameDTO
  ) {
    return this.service.createCityOldName(cityId, body);
  }

  @Delete("/old-name/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteCityOldName(@Param("id", ParseIntPipe) cityOldNameId: number) {
    return this.service.removeCityOldName(cityOldNameId);
  }
}
