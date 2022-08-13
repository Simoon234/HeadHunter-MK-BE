import { Body, Controller, Get, HttpCode, Inject, Param, Post, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LogDto } from "./dto/log.dto";
import { RegisterDto } from "./dto/register.dto";
import { Response } from "express";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { ObjectPerson } from "../decorators/object.decorator";
import { PasswordResetRes, Person } from "../types";

@Controller("/auth")
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get("/check")
  checkAuth(
    @ObjectPerson() person: Person,
    @Res() res: Response
  ): Promise<void> {
    return this.authService.checkAuth(person, res);
  }

  @HttpCode(200)
  @Post("/login")
  log(@Body() log: LogDto, @Res() res: Response): Promise<void> {
    return this.authService.login(log, res);
  }

  @HttpCode(201)
  @Post("/register-hr/:id/:registerToken")
  registerHr(
    @Param("id") id: string,
    @Param("token") registerToken: string,
    @Body() obj: RegisterDto,
    @Res() res: Response
  ): Promise<void> {
    return this.authService.registerHr(id, registerToken, obj, res);
  }

  @HttpCode(201)
  @Post("/register-student/:id/:registerToken")
  registerUser(
    @Param('id') id: string,
    @Param('token') registerToken: string,
    @Body() obj: RegisterDto,
    @Res() res: Response,
  ) {
    return this.authService.registerUser(id, registerToken, obj, res);
  }

  @HttpCode(205)
  @UseGuards(JwtAuthGuard)
  @Get("/logout")
  logout(@ObjectPerson() person: Person, @Res() res: Response): Promise<void> {
    return this.authService.logout(person, res);
  }

  @HttpCode(201)
  @Post("/reset-password")
  resetPassword(@Body("email") email: string): Promise<{ message: string }> {
    return this.authService.remindPassword(email);
  }

  @HttpCode(201)
  @Post("/change-password/:id/:refreshToken")
  changePassword(
    @Param("id") id: string,
    @Param("refreshToken") refreshToken: string,
    @Body("password") password: string
  ): Promise<PasswordResetRes> {
    return this.authService.changePassword(id, refreshToken, password);
  }
}
