import { Controller, Get, Inject, Param } from "@nestjs/common";
import { HrService } from "./hr.service";

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
}
