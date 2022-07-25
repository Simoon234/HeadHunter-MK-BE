import {Body, Controller, Inject, Param, Post, Res} from '@nestjs/common';
import {HrService} from "./hr.service";
import {HrRegisterDto} from "./dto/hr.register.dto";

@Controller('/hr')
export class HrController {
    constructor(@Inject(HrService) private hr: HrService) {
    }

    @Post('/register/:id')
    registerHr(
        @Param('id') id: string,
        @Body() obj: HrRegisterDto, @Res() res: any) {
        return this.hr.register(id, obj, res)
    }
}
