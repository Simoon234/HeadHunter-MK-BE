import { Body, Controller, Get, Inject, Param, Post, Res } from "@nestjs/common";
import { HrService } from "./hr.service";
import { HrRegisterDto } from "./dto/hr.register.dto";

@Controller("/hr")
export class HrController {
  constructor(@Inject(HrService) private hr: HrService) {
  }

  @Get("/interested")
  getAllInterestedUsers() {
    return this.hr.usersAddedToTalkByCurrentHr();
  }

  @Get("/not-interested/:id")
  notInterested(@Param("id") id: string) {
    return this.hr.notInterested(id);
  }

  @Get("/addToTalk/:id")
  addToTalk(@Param("id") id: string) {
    return this.hr.addToTalk(id);
  }

  @Post("/register/:id")
  registerHr(
    @Param("id") id: string,
    @Body() obj: HrRegisterDto,
    @Res() res: any
  ) {
    return this.hr.register(id, obj, res);
  }
}
