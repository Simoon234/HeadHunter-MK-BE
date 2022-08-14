import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Response } from 'express';
import { HrDto } from '../hr/dto/hr.dto';
import { UpdateAdmin } from './dto/update-admin.dto';
import { Roles } from '../decorators/roles.decorator';
import { AddUsersDto } from './dto/add-users.dto';
import { Role } from '../types';

@Controller('/admin')
export class AdminController {
  constructor(@Inject(AdminService) private adminService: AdminService) {}

  @Roles(Role.ADMIN)
  @HttpCode(200)
  @Put('/:id')
  update(@Param('id') id, @Body() obj: UpdateAdmin, @Res() res: Response) {
    return this.adminService.update(id, obj, res);
  }

  @Roles(Role.ADMIN)
  @HttpCode(201)
  @Post('/add/hr')
  addHr(@Body() obj: HrDto, @Res() res: Response) {
    return this.adminService.addHR(obj, res);
  }

  @Roles(Role.ADMIN)
  @HttpCode(201)
  @Post('/add/students')
  uploadStudents(@Body() file: AddUsersDto[], @Res() res: Response) {
    return this.adminService.uploadStudents(file, res);
  }

  @Roles(Role.ADMIN)
  @HttpCode(201)
  @Post('/register')
  register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    return this.adminService.register(email, password, res);
  }
}
