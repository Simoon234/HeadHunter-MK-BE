import { Body, Controller, Get, Inject, Param, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LogDto } from "./dto/log.dto";
import { RegisterDto } from "./dto/register.dto";
import { Response } from "express";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { ObjectPerson } from "../decorators/object.decorator";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {
  }

  @Post("/login")
  log(@Body() log: LogDto, @Res() res: Response) {
    return this.authService.login(log, res);
  }

  @Post("/register-hr/:id/:registerToken")
  registerHr(
    @Param("id") id: string,
    @Param("token") registerToken: string,
    @Body() obj: RegisterDto,
    @Res() res: Response
  ) {
    return this.authService.registerHr(id, registerToken, obj, res);
  }

  @Post("/register-user/:id/:registerToken")
  registerUser(
    @Param("id") id: string,
    @Param("token") registerToken: string,
    @Body() obj: RegisterDto,
    @Res() res: Response
  ) {
    return this.authService.registerUser(id, registerToken, obj, res);
  }

  @Post("/register-hr/:id/:registerToken")
  registerHR(
    @Param("id") id: string,
    @Param("token") registerToken: string,
    @Body() obj: RegisterDto,
    @Res() res: Response
  ) {
    return this.authService.registerHr(id, registerToken, obj, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/logout")
  logout(@ObjectPerson() person: any, @Res() res: Response) {
    return this.authService.logout(person, res);
  }

  @Post("/reset-password")
  resetPassword(@Body() email: string) {
    return this.authService.remindPassword(email);
  }
}
