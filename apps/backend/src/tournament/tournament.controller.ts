import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiEntities, StageUpdateDto, Tournament } from "@fbs2.0/types";
import { isSeasonLabelValid, isTournamentValid } from "@fbs2.0/utils";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { TournamentService } from "./tournament.service";
import { StageDto } from "./entities/stage.dto";
import { StageSubstitutionDto } from "./entities/stage-substitution.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { Stage } from "../match/entities/stage.entity";
import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { StageSubstitution } from "./entities/stage-substitution.entity";
import { TournamentSummary } from "./entities/tournament-summary";

@Controller(ApiEntities.Tournament)
@ApiTags(ApiEntities.Tournament)
export class TournamentController {
  @Inject(TournamentService)
  private readonly service: TournamentService;

  /**
  GET /tournament/seasons
  GET /tournament/seasons?simplified=true
  */
  @Get("seasons")
  @ApiQuery({ name: "simplified", type: Boolean })
  public getSeasons(@Query("simplified") simplified: boolean) {
    return this.service.getAvailableTournaments(simplified);
  }

  /**
  GET /tournament/:season/summary
  */
  @Get("/:season/summary")
  @ApiParam({ name: "season", type: "string" })
  @ApiOkResponse({ type: [TournamentSummary] })
  @ApiBadRequestResponse()
  public getSeasonSummary(@Param("season") season: string) {
    if (!isSeasonLabelValid(season, false)) {
      throw new NotFoundException();
    }

    return this.service.getSeasonSummary(season);
  }

  /**
  GET /tournament/:season/:tournament
  */
  @Get("/:season/:tournament")
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiOkResponse({ type: [Stage] })
  @ApiBadRequestResponse()
  public getStages(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament,
  ) {
    if (!isSeasonLabelValid(season, false) || !isTournamentValid(tournament)) {
      throw new NotFoundException();
    }

    return this.service.getStages(season, tournament);
  }

  /**
  POST /tournament/:season/:tournament
  */
  @Post("/:season/:tournament")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiCreatedResponse({ type: TournamentSeason })
  @ApiBadRequestResponse()
  public createTournament(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament,
    @Body() body: StageDto[],
  ) {
    if (!isSeasonLabelValid(season, false) || !isTournamentValid(tournament)) {
      throw new NotFoundException();
    }

    return this.service.createTournament(season, tournament, body);
  }

  /**
  DELETE /tournament/:id
  */
  @Delete("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteTournament(@Param("id", new ParseIntPipe()) id: number) {
    return this.service.removeTournament(id);
  }

  /**
  POST /tournament/create-stage-substitution
  */
  @Post("/create-stage-substitution")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: StageSubstitution })
  public createStageSubstitution(@Body() body: StageSubstitutionDto) {
    return this.service.createStageSubstitution(body);
  }

  /**
  POST /tournament/:season/:tournament/stage
  */
  @Post("/:season/:tournament/stage")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiCreatedResponse({ type: Stage })
  @ApiBadRequestResponse()
  public appendStage(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament,
    @Body() body: StageDto,
  ) {
    if (!isSeasonLabelValid(season, false) || !isTournamentValid(tournament)) {
      throw new NotFoundException();
    }

    return this.service.appendStage(season, tournament, body);
  }

  /**
  PATCH /tournament/stage/:id
  */
  @Patch("/stage/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: Stage })
  public updateStage(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() body: StageUpdateDto,
  ) {
    return this.service.updateStage(id, body);
  }

  /**
  DELETE /tournament/stage/:id
  */
  @Delete("/stage/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteStage(@Param("id", new ParseIntPipe()) id: number) {
    return this.service.removeStage(id);
  }
}
