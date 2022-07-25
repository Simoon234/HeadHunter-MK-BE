import {Body, Controller, Get, Inject, Param, Patch, Query, Req, Res} from '@nestjs/common';
import {UserService} from "./user.service";
import {UserUpdateDto} from "./dto/user.update.dto";
import {UserFilterInterface} from "../types";

@Controller('/user')
export class UserController {
    constructor(@Inject(UserService) private userService: UserService) {
    }

    @Get('/all/active/:itemsOnPage/:page')
    getAllActiveUsers(@Param('itemsOnPage') itemsOnPage: number, @Param('page') page: number) {
        return this.userService.getAllActiveUsers(itemsOnPage, page);
    }

    @Get('/details/:id')
    getSingleUserCV(@Param('id') id: string, @Res() res: any) {
        return this.userService.getSingleUserCV(id, res);
    }

    @Get('/hired/:id')
    userGotJob(@Param('id') id: string) {
        return this.userService.userFoundJob(id);
    }

    @Patch('/update/:id')
    updateUser(@Param('id') id: string, @Body() user: UserUpdateDto) {
        return this.userService.updateUserAfterLogin(id, user);
    }

    @Get('/filter')
    filterData(@Query() query: UserFilterInterface) {
        return this.userService.filterUsers(query);
    }
}
