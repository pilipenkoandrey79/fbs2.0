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
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiEntities, Tournament } from "@fbs2.0/types";
import { isSeasonLabelValid, isTournamentValid } from "@fbs2.0/utils";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";

import { ParticipantService } from "./participant.service";
import { CreateParticipantDto } from "./entities/participant.dto";
import { Participant } from "./entities/participant.entity";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { SeasonParticipants } from "./entities/season-participants";

@Controller(ApiEntities.Participant)
@ApiTags(ApiEntities.Participant)
@ApiExtraModels(SeasonParticipants)
export class ParticipantController {
  @Inject(ParticipantService)
  private readonly service: ParticipantService;

  @Get("/:season/all")
  @ApiParam({ name: "season", type: "string" })
  @ApiOkResponse({ type: [SeasonParticipants] })
  @ApiBadRequestResponse()
  public getAllParticipants(@Param("season") season: string) {
    if (!isSeasonLabelValid(season, false)) {
      throw new BadRequestException();
    }

    return this.service.getAllSeasonParticipants(season);
  }

  @Get("/:season/:tournament")
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiOkResponse({ type: [Participant] })
  @ApiBadRequestResponse()
  public getParticipants(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament
  ) {
    if (!isSeasonLabelValid(season, false) || !isTournamentValid(tournament)) {
      throw new BadRequestException();
    }

    return this.service.getParticipants(season, tournament);
  }

  @Post("/:season/:tournament")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiCreatedResponse({ type: Participant })
  public createParticipant(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament,
    @Body() body: CreateParticipantDto
  ): Promise<Participant> {
    return this.service.createParticipant(
      season,
      tournament,
      body.clubId,
      body.startingStage
    );
  }

  @Put("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: Participant })
  public updateParticipant(
    @Param("id", new ParseIntPipe()) id: number,
    @Body() body: CreateParticipantDto
  ): Promise<Participant> {
    return this.service.editParticipant(id, body.clubId, body.startingStage);
  }

  @Post("/:season/:tournament/add-from-other-tournament")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiCreatedResponse()
  public addParticipantsFromAnotherTournament(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament
  ): Promise<number> {
    return this.service.addParticipantsFromAnotherTournament(
      season,
      tournament
    );
  }

  @Post("/:season/:tournament/copy-from-prev-season")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "season", type: "string" })
  @ApiParam({ name: "tournament", enum: Tournament })
  @ApiCreatedResponse()
  public copyParticipantsFromPreviousSeason(
    @Param("season") season: string,
    @Param("tournament") tournament: Tournament
  ) {
    return this.service.copyParticipantsFromPreviousSeason(season, tournament);
  }

  @Delete("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteParticipant(@Param("id", new ParseIntPipe()) id: number) {
    return this.service.removeParticipant(id);
  }
}
