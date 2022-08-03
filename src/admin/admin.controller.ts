import { Body, Controller, HttpCode, Inject, Param, Post, Put, Res } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { Response } from "express";
import { HrDto } from "../hr/dto/hr.dto";
import { ChangePassword } from "./dto/changePassword.dto";
import { Roles } from "../decorators/roles.decorator";
import { AddUsersDto } from "./dto/add-users.dto";
import { Role } from "../types";

@Controller("/admin")
export class AdminController {
  constructor(@Inject(AdminService) private adminService: AdminService) {
  }

  @HttpCode(200)
  @Put("/changePassword/:email")
  changePassword(@Param("email") email, @Body() obj: ChangePassword) {
    return this.adminService.changePassword(email, obj);
  }

  @Roles(Role.ADMIN)
  @HttpCode(201)
  @Post('/add/hr')
  addHr(@Body() obj: HrDto, @Res() res: Response) {
    return this.adminService.addHumanResource(obj, res);
  }

  @HttpCode(201)
  @Post("/upload")
  uploadUsers(@Body() file: AddUsersDto[], @Res() res: Response) {
    return this.adminService.upload(file, res);
  }

  // first admin generate, later delete this.
  @HttpCode(201)
  @Post('/register')
  register(@Body('email') email: string, @Body('password') password: string) {
    return this.adminService.register(email, password);
  }

}
