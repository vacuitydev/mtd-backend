import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class DebugController {

    @Get('/')
    signsOfLife(){
        return "Hello world"
    }
}
