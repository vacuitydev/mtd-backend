import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {HttpCode, HttpStatus} from '@nestjs/common'
import { CreationRequestDTO, DetailsDTO } from './dto';
import { ConverterService } from './converter.service';

@Controller('converter')
export class ConverterController {
  constructor(private converterService: ConverterService) {}
  @HttpCode(200)
  @Post('/create')
  async createDocx(@Body() creationRequest: CreationRequestDTO) {
    return this.converterService.createDocx(creationRequest);
  }
}
