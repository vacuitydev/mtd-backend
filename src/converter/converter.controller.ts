import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {HttpCode, HttpStatus} from '@nestjs/common'
import { DetailsDTO } from './dto';
import { ConverterService } from './converter.service';

@Controller('converter')
export class ConverterController {
  constructor(private converterService: ConverterService) {}
  @HttpCode(200)
  @Post('/patched')
  async patchDocx(@Body() detailsDTO: DetailsDTO) {
    console.log("details", detailsDTO)
    return this.converterService.patchDocx(detailsDTO);
  }
  @Post('/created')
  async createDocx(@Body() detailsDTO: DetailsDTO) {
    return this.converterService.createDocx(detailsDTO);
  }
}
