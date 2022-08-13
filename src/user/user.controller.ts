import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { UserUpdateDto } from './dto/user.update.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../types';

@Controller('/user')
export class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @HttpCode(200)
  @Roles(Role.STUDENT || Role.HR)
  @Get('/details/:id')
  getSingleUserCV(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.userService.getSingleUserCV(id, res);
  }

  @Roles(Role.STUDENT)
  @HttpCode(200)
  @Get('/hired/:id')
  userGotJob(@Param('id') id: string, @Res() res: Response): Promise<void> {
    return this.userService.userFoundJob(id, res);
  }

  @Roles(Role.STUDENT)
  @Patch('/update/:id')
  updateUser(
    @Param('id') id: string,
    @Res() res: Response,
    @Body() user: UserUpdateDto,
  ): Promise<void> {
    return this.userService.updateUserAfterLogin(id, res, user);
  }

  @Roles(Role.STUDENT || Role.HR)
  @HttpCode(205)
  @Get('/delete-account/:id')
  deleteAccount(@Param('id') id: string, @Res() res: Response) {
    return this.userService.deleteAccount(id, res);
  }
}
