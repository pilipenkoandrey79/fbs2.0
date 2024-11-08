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
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiEntities } from "@fbs2.0/types";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";

import { ClubService } from "./club.service";
import { Club } from "./entities/club.entity";
import { _CreateClubDto } from "./entities/_club.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { ClubCV } from "./entities/club-cv";
import { _OldClubNameDto } from "./entities/_old-club-name.dto";
import { OldClubName } from "./entities/old-club-name.entity";

@ApiTags(ApiEntities.Club)
@Controller(ApiEntities.Club)
export class _ClubController {
  @Inject(ClubService)
  private readonly service: ClubService;

  @Get()
  @ApiOkResponse({ type: [Club] })
  @ApiQuery({ name: "countryId", type: Number })
  @ApiNotFoundResponse()
  public getClubs(@Query("countryId") countryId: number): Promise<Club[]> {
    return this.service.getClubs(countryId);
  }

  @Get("/:id")
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: Club })
  public getClub(@Param("id", ParseIntPipe) id: number): Promise<Club> {
    return this.service.getClub(id);
  }

  @Get("/:id/cv")
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: [ClubCV] })
  public getClubCV(@Param("id", ParseIntPipe) id: number): Promise<ClubCV[]> {
    return this.service.getClubCV(id);
  }

  @Put("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiOkResponse({ type: Club })
  public updateClub(@Body() body: Club): Promise<Club> {
    return this.service._updateClub(body);
  }

  @Delete("/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteClub(@Param("id", ParseIntPipe) clubId: number) {
    return this.service.removeClub(clubId);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Club })
  public createClub(@Body() body: _CreateClubDto): Promise<Club> {
    return this.service._createClub(body);
  }

  @Post("/:id/old-name")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiCreatedResponse({ type: OldClubName })
  public createClubOldName(
    @Param("id", ParseIntPipe) clubId: number,
    @Body() body: _OldClubNameDto
  ) {
    return this.service.createClubOldName(clubId, body);
  }

  @Delete("/old-name/:id")
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiParam({ name: "id", type: "number" })
  @ApiNoContentResponse()
  public deleteClubOldName(@Param("id", ParseIntPipe) clubOldNameId: number) {
    return this.service.removeClubOldName(clubOldNameId);
  }
}
