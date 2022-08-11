import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { UserUpdateDto } from './dto/user.update.dto';

@Controller('/user')
export class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @Get('/details/:id')
  getSingleUserCV(@Param('id') id: string, @Res() res: any) {
    return this.userService.getSingleUserCV(id, res);
  }

  @Get('/hired/:id')
  userGotJob(@Param('id') id: string, @Res() res: Response) {
    return this.userService.userFoundJob(id, res);
  }

  @Patch('/update/:id')
  updateUser(
    @Param('id') id: string,
    @Res() res: Response,
    @Body() user: UserUpdateDto,
  ) {
    return this.userService.updateUserAfterLogin(id, res, user);
  }

  @Get('/delete-account/:id')
  deleteAccount(@Param('id') id: string, @Res() res: Response) {
    return this.userService.deleteAccount(id, res);
  }
}
