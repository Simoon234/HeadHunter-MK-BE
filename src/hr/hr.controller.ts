import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put, Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HrService } from './hr.service';
import { Response } from 'express';
import { HrUpdateDto } from './dto/hr-update.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('/hr')
export class HrController {
  constructor(@Inject(HrService) private hr: HrService) {}

  @Get('/interested/:id/:itemsOnPage/:page')
  getAllInterestedUsers(
    @Param('id') id: string,
    @Param('itemsOnPage') itemsOnPage: number,
    @Param('page') page: number,
    @Res() res: Response,
  ) {
    return this.hr.usersAddedToTalkByCurrentHr(id, itemsOnPage, page, res);
  }

  @Get('/not-interested/:hrId/:userId')
  notInterested(
    @Param('hrId') hrId: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    return this.hr.notInterested(userId, hrId, res);
  }

  @Get('/addToTalk/:id/:userId')
  addToTalk(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Res() res: Response,
  ) {
    return this.hr.addToTalk(id, userId, res);
  }

  @Put('/update/:id')
  update(@Param('id') id, @Body() obj: HrUpdateDto, @Res() res: Response) {
    return this.hr.update(id, obj, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/all/active/:id/:itemsOnPage/:page')
  getAllActiveUsers(
    @Param('itemsOnPage') itemsOnPage: number,
    @Param('page') page: number,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    return this.hr.getAllActiveUsers(id, itemsOnPage, page, res);
  }

  @Get('/hired/:id')
  userGotJob(@Param('id') id: string, @Res() res: Response) {
    return this.hr.userFoundJob(id, res);
  }
}
