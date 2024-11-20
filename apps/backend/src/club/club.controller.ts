import {
  Controller,
  Inject,
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

import { ClubService } from "./club.service";
import { Club } from "./entities/club.entity";
import { ClubDto } from "./entities/club.dto";
import { AccessTokenGuard } from "../auth/guards/access-token.guard";

@ApiTags(`v2/${ApiEntities.Club}`)
@Controller(`v2/${ApiEntities.Club}`)
export class ClubController {
  @Inject(ClubService)
  private readonly service: ClubService;

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

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Club })
  public createClub(@Body() body: ClubDto): Promise<Club> {
    return this.service.createClub(body);
  }
}
