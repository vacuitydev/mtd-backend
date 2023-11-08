import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as path from 'path';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    let moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    app.useLogger(new Logger());
    app.useGlobalPipes(
      new ValidationPipe({
        // Comes with Nestjs
        whitelist: true, //Discards extra information
        // For example, if the body had DateOfDeath and other keys as well, it would discard them in the SignupDTO
      }),
    );

    await app.listen(3000);
    pactum.request.setBaseUrl('http://localhost:3000');
    jest.setTimeout(30000)
  });
  describe('PDF generation', () => {
    const file = path.join(__dirname, "./", "experience.md");
    const experience = readFileSync(file).toString()
    it('should be able to create patched pdf', () => {
      return pactum.spec().post('/converter/patched').withBody({
        name: 'John Smith',
        experience
      }).withRequestTimeout(50000).expectStatus(200);
    }, 0);
    it('should be able to create infant pdf', ()=>{
      return pactum.spec().post('/converter/created').withBody({
        name: "John smith",
        experience
      }).withRequestTimeout(50000).expectStatus(200);
    })
  });

  afterAll(() => {
    app.close();
  });
});
// describe("test list parsing", ()=>{
//   it('should be able to patch lists', ()=>{
//     const file = path.join(__dirname, "./", "list-text.md");
//     const fdr = readFileSync(file, "utf8")
//     patchMarkdownToDocx("name", fdr)
//   })
//   it('should be able to create lists', ()=>{
//     const file = path.join(__dirname, "./", "list-text.md");
//     const fdr = readFileSync(file, "utf8")
//     markdownToDocx("name", fdr)
//   })
// })
