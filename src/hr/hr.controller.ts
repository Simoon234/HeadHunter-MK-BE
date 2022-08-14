import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HrService } from './hr.service';
import { Response } from 'express';
import { HrUpdateDto } from './dto/hr-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Role } from 'src/types';
import { Roles } from '../decorators/roles.decorator';

@Controller('/hr')
export class HrController {
  constructor(@Inject(HrService) private hr: HrService) {}

  @Roles(Role.HR)
  @HttpCode(200)
  @Get('/interested/:id/:itemsOnPage/:page')
  getAllInterestedUsers(
    @Param('id') id: string,
    @Param('itemsOnPage') itemsOnPage: number,
    @Param('page') page: number,
    @Res() res: Response,
  ): Promise<void> {
    return this.hr.usersAddedToTalkByCurrentHr(id, itemsOnPage, page, res);
  }

  @Roles(Role.HR)
  @HttpCode(200)
  @Get('/not-interested/:hrId/:userId')
  notInterested(
    @Param('hrId') hrId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.hr.notInterested(userId, hrId, res);
  }

  @Roles(Role.HR)
  @HttpCode(200)
  @Get('/add-to-talk/:id/:userId')
  addToTalk(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.hr.addToTalk(id, userId, res);
  }

  @Roles(Role.HR)
  @Put('/update/:id')
  update(
    @Param('id') id,
    @Body() obj: HrUpdateDto,
    @Res() res: Response,
  ): Promise<void> {
    return this.hr.update(id, obj, res);
  }

  @Roles(Role.HR)
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Get('/all/active/:id/:itemsOnPage/:page')
  getAllActiveUsers(
    @Param('itemsOnPage') itemsOnPage: number,
    @Param('page') page: number,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.hr.getAllActiveUsers(id, itemsOnPage, page, res);
  }

  @Roles(Role.HR)
  @HttpCode(200)
  @Get('/hired/:id')
  userGotJob(@Param('id') id: string, @Res() res: Response) {
    return this.hr.userFoundJob(id, res);
  }

  @Roles(Role.HR)
  @HttpCode(200)
  @Get(`/filter-available/:page/:itemsOnPage/:id`)
  filterAvailableStudents(
    @Query() filter: any,
    @Res() res: Response,
    @Param('itemsOnPage') itemsOnPage: number,
    @Param('page') page: number,
    @Param('id') id: string,
  ) {
    return this.hr.filterAvailableStudents(filter, page, itemsOnPage, id, res);
  }

  @Roles(Role.HR)
  @Get(`/filter-to-talk/:page/:itemsOnPage/:id`)
  filterToTalkStudents(
    @Query() filter: any,
    @Res() res: Response,
    @Param('itemsOnPage') itemsOnPage: number,
    @Param('page') page: number,
    @Param('id') id: string,
  ) {
    return this.hr.filterToTalkStudents(filter, page, itemsOnPage, id, res);
  }
}
