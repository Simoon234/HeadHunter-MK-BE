import { Body, Controller, Get, Inject, Param, Put, Res } from '@nestjs/common';
import { HrService } from './hr.service';
import { Response } from 'express';
import { HrUpdateDto } from './dto/hr-update.dto';

@Controller('/hr')
export class HrController {
  constructor(@Inject(HrService) private hr: HrService) {}

  @Get('/interested')
  getAllInterestedUsers() {
    return this.hr.usersAddedToTalkByCurrentHr();
  }

  @Get('/not-interested/:id')
  notInterested(@Param('id') id: string) {
    return this.hr.notInterested(id);
  }

  @Get('/addToTalk/:id')
  addToTalk(@Param('id') id: string) {
    return this.hr.addToTalk(id);
  }

  @Put('/update/:id')
  update(@Param('id') id, @Body() obj: HrUpdateDto, @Res() res: Response) {
    return this.hr.update(id, obj, res);
  }
}
