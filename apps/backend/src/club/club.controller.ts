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
import { ClubDto } from "./entities/club.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";
import { ClubCV } from "./entities/club-cv";

@ApiTags(`${ApiEntities.Club}/v2`)
@Controller(`${ApiEntities.Club}/v2`)
export class ClubController {
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
  public updateClub(
    @Param("id", ParseIntPipe) clubId: number,
    @Body() body: ClubDto
  ): Promise<Club> {
    return this.service.updateClub(clubId, body);
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
  public createClub(@Body() body: ClubDto): Promise<Club> {
    return this.service.createClub(body);
  }
}
