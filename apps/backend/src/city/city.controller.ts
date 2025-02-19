import {
  Controller,
  Inject,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Body,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiEntities } from "@fbs2.0/types";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { City } from "./entities/city.entity";
import { CityDto } from "./entities/city.dto";
import { CityService } from "./city.service";

@ApiTags(`v2/${ApiEntities.City}`)
@Controller(`v2/${ApiEntities.City}`)
export class CityController {
  @Inject(CityService)
  private readonly service: CityService;

  @Get("/:id")
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: City })
  public getCity(@Param("id", ParseIntPipe) cityId: number): Promise<City> {
    return this.service.getCity(cityId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: City })
  public createCity(@Body() body: CityDto): Promise<City> {
    return this.service.createCity(body);
  }

  @Put("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: City })
  public updateCity(
    @Param("id", ParseIntPipe) cityId: number,
    @Body() body: CityDto
  ): Promise<City> {
    return this.service.updateCity(cityId, body);
  }
}
