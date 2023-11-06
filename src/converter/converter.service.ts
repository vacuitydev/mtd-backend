import { Injectable } from '@nestjs/common';
import { DetailsDTO } from './dto';
import { markdownToDocx, patchMarkdownToDocx } from './markdown-to-docx/parser';
import { readFileSync, writeFileSync } from 'fs';
import * as unoconv from 'awesome-unoconv';
import * as path from 'path';

@Injectable()
export class ConverterService {
  async patchDocx(detailsDto: DetailsDTO) {
    const patched = await patchMarkdownToDocx(
      detailsDto.name,
      detailsDto.experience,
    );
    const uniqueName = `${(new Date().toISOString()).split(".")[0].replaceAll(":", "-")}`;
    // Save so unoconv can read it
    const docxPath = path.resolve(`./testing_output/${uniqueName}_patched.docx`)
    const pdfPath  = path.resolve(`./testing_output/${uniqueName}_patched.pdf`)
    writeFileSync(docxPath, patched);
    console.log(`Find the files at ${docxPath}, ${pdfPath}`);
    const result = await unoconv.convert(
      docxPath, pdfPath
    );
    return {
      pdf: readFileSync(pdfPath).toString('base64')
    };
  }
  async createDocx(detailsDto:DetailsDTO){
    const created =await markdownToDocx(detailsDto.name, detailsDto.experience);
    const uniqueName = `${(new Date().toISOString()).split(".")[0].replaceAll(":", "-")}`;
    // Save so unoconv can read it
    const docxPath = path.resolve(`./testing_output/${uniqueName}_created.docx`)
    const pdfPath  = path.resolve(`./testing_output/${uniqueName}_created.pdf`)
    writeFileSync(docxPath, created);
    console.log(`Find the files at ${docxPath}`);
    const result = await unoconv.convert(
        docxPath,
        pdfPath,
    );
    return {
      pdf: readFileSync(pdfPath).toString('base64')
    };
  }
}