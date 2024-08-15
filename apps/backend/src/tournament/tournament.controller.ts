import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
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

import { TournamentService } from "./tournament.service";
import { StageDto } from "./entities/stage.dto";
import { StageSubstitutionDto } from "./entities/stage-substitution.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { AvailableTournament } from "./entities/available-tournament";
import { Stage } from "../match/entities/stage.entity";
import { TournamentSeason } from "../shared/entities/tournament-season.entity";
import { StageSubstitution } from "./entities/stage-substitution.entity";

@Controller(ApiEntities.Tournament)
@ApiTags(ApiEntities.Tournament)
export class TournamentController {
  @Inject(TournamentService)
  private readonly service: TournamentService;

  @Get("seasons")
  @ApiOkResponse({ type: AvailableTournament })
  public getSeasons() {
    return this.service.getAvailableTournaments();
  }

  @Get("/:season/:tournament")
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiOkResponse({ type: [Stage] })
  @ApiBadRequestResponse()
  public getStages(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament
  ) {
    if (!isSeasonLabelValid(season, false) || !isTournamentValid(tournament)) {
      throw new BadRequestException();
    }

    return this.service.getStages(season, tournament);
  }

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
    @Body() body: StageDto[]
  ) {
    if (!isSeasonLabelValid(season, false) || !isTournamentValid(tournament)) {
      throw new BadRequestException();
    }

    return this.service.createTournament(season, tournament, body);
  }

  @Delete("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteTournament(@Param("id", new ParseIntPipe()) id: number) {
    return this.service.removeTournament(id);
  }

  @Post("/create-stage-substitution")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: StageSubstitution })
  public createStageSubstitution(@Body() body: StageSubstitutionDto) {
    return this.service.createStageSubstitution(body);
  }
}
