import { Injectable } from '@nestjs/common';
import { CreationRequestDTO, DetailsDTO } from './dto';
import { readFileSync, writeFileSync } from 'fs';
import * as unoconv from 'awesome-unoconv';
import * as path from 'path';
import { Packer } from 'docx';
import { getTemplateFromId_stub } from './templates';

@Injectable()
export class ConverterService {
  async markdownToDocx(detailsDto: DetailsDTO,templateId = 0, debug = false) {
    /* The tokens are of types
    - paragraph
    paragraph has a tokens property that contains the children of the paragraph.
    - heading
    - text
    - space
    - list
    A list has a sub-array of items, each of which can be their own token types
    We can work with these
    */
    console.log('Details', detailsDto);
    const requiredTemplate = getTemplateFromId_stub(templateId)
    let doc = requiredTemplate(detailsDto);
    // Save for debug purposes, ignore if occupied
    try {
      writeFileSync('last_generated.docx', await Packer.toBuffer(doc));
    } catch (e) {
      console.error(e);
    }
    return doc;
  }
  async createDocx(creationRequest: CreationRequestDTO) {
    const created = await this.markdownToDocx(creationRequest.details);
    const uniqueName = `${new Date()
      .toISOString()
      .split('.')[0]
      .replaceAll(':', '-')}`;
    // Save so unoconv can read it
    const docxPath = path.resolve(
      `./testing_output/${uniqueName}_created.docx`,
    );
    const pdfPath = path.resolve(`./testing_output/${uniqueName}_created.pdf`);
    writeFileSync(docxPath, await Packer.toBuffer(created));
    if (creationRequest.getDocx) {
      return {
        docx: await Packer.toBuffer(created),
      };
    }
    console.log(`Find the files at ${docxPath}`);
    const result = await unoconv.convert(docxPath, pdfPath);

    return {
      pdf: readFileSync(pdfPath).toString('base64'),
    };
  }
}
