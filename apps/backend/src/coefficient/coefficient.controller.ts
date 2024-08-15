import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiEntities } from "@fbs2.0/types";
import { isSeasonLabelValid } from "@fbs2.0/utils";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { CoefficientService } from "./coefficient.service";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { Winner } from "./entities/winner";
import { CoefficientHistoryItem } from "./entities/coefficient-history-item";
import { CoefficientData } from "./entities/coefficient-data";

@Controller(ApiEntities.Coefficient)
@ApiTags(ApiEntities.Coefficient)
export class CoefficientController {
  @Inject(CoefficientService)
  private readonly service: CoefficientService;

  // Not documented properly
  @Get("/:season")
  @ApiOperation({ deprecated: true })
  public getAllSeasonClubCoefficients(@Param("season") season: string) {
    return this.service.getAllSeasonClubCoefficients(season);
  }

  @Get("/:season/winners")
  @ApiParam({ name: "season", type: "string" })
  @ApiOkResponse({ type: [Winner] })
  @ApiBadRequestResponse()
  public getWinners(@Param("season") season: string) {
    if (!isSeasonLabelValid(season, false)) {
      throw new BadRequestException();
    }

    return this.service.getWinners(season);
  }

  @Get("/country/:countryId")
  @ApiParam({ name: "countryId", type: "number" })
  @ApiOkResponse({ type: [CoefficientHistoryItem] })
  public getCountryCoefficientHistory(
    @Param("countryId", new ParseIntPipe()) countryId: number
  ): Promise<CoefficientHistoryItem[]> {
    return this.service.getCountryCoefficientHistory(countryId);
  }

  @Get("/:season/full")
  @ApiParam({ name: "season", type: "string" })
  @ApiOkResponse({ type: [CoefficientData] })
  public getCountryCoefficient(@Param("season") season: string) {
    return this.service.getCountryCoefficient(season);
  }

  @Post("/:season")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "season", type: "string" })
  @ApiCreatedResponse()
  public calculateSeasonClubCoefficients(@Param("season") season: string) {
    return this.service.calculateSeasonClubCoefficients(season);
  }
}
