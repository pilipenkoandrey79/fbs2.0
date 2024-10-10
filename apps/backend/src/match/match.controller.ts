import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiEntities, Tournament } from "@fbs2.0/types";
import { isSeasonLabelValid, isTournamentValid } from "@fbs2.0/utils";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { MatchService } from "./match.service";
import { Match } from "./entities/match.entity";
import { CreateMatchDto } from "./entities/match.dto";
import { DeleteMatchDto } from "./entities/delete-match.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { TournamentPart } from "./entities/tournament-part";
import { UpdateMatchResultDto } from "./entities/match-result.dto";

@Controller(ApiEntities.Match)
@ApiTags(ApiEntities.Match)
export class MatchController {
  @Inject(MatchService)
  private readonly service: MatchService;

  @Get("/combat")
  @ApiOkResponse({ type: [Match] })
  public getTwoCountriesMatches(
    @Query("countryId", new ParseIntPipe()) countryId: number,
    @Query("rivalId", new ParseIntPipe()) rivalId: number
  ) {
    return this.service.getTwoCountriesMatches(countryId, rivalId);
  }

  @Get("/:season")
  @ApiParam({ name: "season", type: "string" })
  @ApiOkResponse({ type: [Match] })
  @ApiBadRequestResponse()
  public getAllSeasonMatches(@Param("season") season: string) {
    if (!isSeasonLabelValid(season, false)) {
      throw new NotFoundException();
    }

    return this.service.getAllSeasonMatches(season);
  }

  @Get("/:season/:tournament")
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiBadRequestResponse()
  @ApiOkResponse({ type: [TournamentPart] })
  public getMatches(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament
  ) {
    if (!isSeasonLabelValid(season, false) || !isTournamentValid(tournament)) {
      throw new NotFoundException();
    }

    return this.service.getMatches(season, tournament);
  }

  @Post("/:season/:tournament")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiCreatedResponse({ type: Match })
  public createMatch(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament,
    @Body() body: CreateMatchDto
  ): Promise<Match> {
    return this.service.createMatch(season, tournament, body);
  }

  @Put("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: Match })
  public setResults(
    @Param("id") id: number,
    @Body() body: UpdateMatchResultDto
  ): Promise<Match> {
    return this.service.updateMatchResult(id, body);
  }

  @Delete("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteMatch(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() body: DeleteMatchDto
  ) {
    return this.service.removeMatch(id, body);
  }

  @Delete("/:id/results")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteMatchResults(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() body: DeleteMatchDto
  ) {
    return this.service.removeMatchResults(id, body);
  }
}
