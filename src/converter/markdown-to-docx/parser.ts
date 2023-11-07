import { AlignmentType, UnderlineType } from 'docx';
import { Token, marked } from 'marked';
import {
  HeadingLevel,
  PatchType,
  patchDocument,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { readFileSync, writeFileSync } from 'fs';
import { DetailsDTO } from '../dto';
// // Obsolete for usage reasons, manually specify levels of flatness instead.
// // Returns a higher order function that flattens the array
// function flattenerinator(arr){

//   const seaLevel = []
//   for (const element in arr){
//     if(Array.isArray(element) && element.some(e=>Array.isArray(e))){
//       return ((element)=>flattenerinator(element))(element)
//     }else{
//       return (element)=>element
//     }

//   }
// }
// flattenerinator([1,2,3])
function aggressiveFlattenArray(arr) {
  // Create an empty array to hold the flattened result
  const flattened = [];

  // Iterate through the elements of the input array
  for (const element of arr) {
    // let midway = element
    // while(Array.isArray(midway)){
    //   midway = aggressiveFlattenArray(midway)
    // }
    // flattened.push(midway);
    if (Array.isArray(element)) {
      // If the element is an array, spread its contents into the flattened array
      flattened.push(...element);
    } else {
      //   // If the element is not an array, simply push it to the flattened array
      flattened.push(element);
    }
  }

  return flattened;
}

interface TokenToDocxOptions {
  debug?: boolean;
  bold?: boolean;
  ignoreParagraph?: boolean;
  headingOffset?: number;
  italics?: boolean;
}

function tokenToDocxObject(
  token,
  options: undefined | TokenToDocxOptions = {
    bold: false,
    ignoreParagraph: false,
    debug: false,
    headingOffset: 0,
    italics: false,
  },
) {
  if (options.debug == true) {
    console.log('Operating on ', token, 'Options', options);
  }
  switch (token.type) {
    case 'paragraph':
      let children = token.tokens.map((_token) =>
        tokenToDocxObject(_token, options),
      );
      children = aggressiveFlattenArray(children);
      let result;
      if (options.debug) console.log('children', children);

      if (options.ignoreParagraph) {
        return aggressiveFlattenArray(children);
      } else {
        const result = new Paragraph({
          children,
        });
        return result;
      }
    case 'text':
      if (token.tokens !== undefined) {
        return token.tokens.map((_token, index) =>
          tokenToDocxObject(_token, { ...options }),
        );
      }
      return new TextRun({
        text: token.raw,
        bold: options.bold,
        italics: options.italics,
      });
    case 'em':
      return aggressiveFlattenArray(
        token.tokens.map((_token, index) =>
          tokenToDocxObject(_token, { italics: true, ...options }),
        ),
      );
    case 'strong':
      return aggressiveFlattenArray(
        token.tokens.map((_token, index) =>
          tokenToDocxObject(_token, { bold: true, ...options }),
        ),
      );
    case 'heading':
      const headingLevel: number = token.depth + (options.headingOffset ?? 0);
      if(options.debug)console.log('Heading level', headingLevel);
      return new Paragraph({
        heading: `Heading${headingLevel}` as HeadingLevel,
        children: aggressiveFlattenArray(
          token.tokens.map((_token) => tokenToDocxObject(_token, options)),
        ),
      });
    case 'list':
      // return token.items.map((v,i)=>new TextRun({text:v}))
      const resultsArray = token.items.map((_token, index) =>
        tokenToDocxObject(_token, options),
      );

      return aggressiveFlattenArray(resultsArray);
    case 'list_item':
      const listItems = aggressiveFlattenArray(
        token.tokens.map((_token) => tokenToDocxObject(_token, options)),
      );
      const reflatted = aggressiveFlattenArray(listItems);
      if(options.debug)console.log('List items', listItems);
      if(options.debug)console.log('Reflatted list items', reflatted);
      return new Paragraph({
        bullet: {
          level: 0,
        },
        children: reflatted,
      });
    case 'space':
      return new Paragraph({ children: [] });
    default:
      break;
  }
}
const sectionToDocx = (section, options: TokenToDocxOptions = {}) => {
  if (section === '' || section===undefined) {
    return [
      new Paragraph({
        text: '',
      }),
    ];
  }
  const sectionTokens = marked.lexer(section);
  if(options.debug===true) console.log('Section tokens', sectionTokens);
  let sectionDocxObjects = sectionTokens.map((token, index) => {
    return tokenToDocxObject(token, options);
  });
  return (sectionDocxObjects = aggressiveFlattenArray(sectionDocxObjects));
};
function fillTemplate(detailsDto: DetailsDTO) {
  // A template is free to fill out the underlying tokens however it pleases for each sections
  // For example, a template may choose to ignore paragraphing for the name to make sure it is always a certain heading level
  
  // This template ignores user paragraphing for the name section
  const nameDocxObjects = sectionToDocx(detailsDto.name, {
    ignoreParagraph: true,
  });
  const experienceDocxObjects = sectionToDocx(detailsDto.experience);
  const languagesDocxObjects = sectionToDocx(detailsDto.languages) 
  const projectsDocxObjects = sectionToDocx(detailsDto.projects) 
  const educationDocxObjects = sectionToDocx(detailsDto.education, {debug:true})
  console.log("Education", educationDocxObjects) 
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'title',
          name: 'Title',
          basedOn: 'Normal',
          next: 'Heading1',
          quickFormat: true,
          run: {
            size: 32,
            bold: true,
            color: '22eeaa',

            // type: UnderlineType.DOUBLE,
            // color: "FF0000",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Heading2',
          quickFormat: true,
          run: {
            size: 32,
            bold: true,
            color: 'ee22aa',

            // type: UnderlineType.DOUBLE,
            // color: "FF0000",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 26,
            bold: true,
            color: '999999',

            // type: UnderlineType.DOUBLE,
            // color: "FF0000",
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
      ],
    },

    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 250 * 2,
              bottom: 250 * 2,
              right: 150 * 2,
              left: 150 * 2,
            },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [...nameDocxObjects],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            text: 'This is an infant docx',
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            text: 'This docx was generated purely in JS and not patched into a template. Following text is from the user input',
            alignment: AlignmentType.LEFT,
          }),
          new Paragraph({
            text: 'Experience',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
          }),
          ...experienceDocxObjects,
          new Paragraph({
            text: 'Languages',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
          }),
          ...languagesDocxObjects,
          
          new Paragraph({
            text: 'Projects',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
          }),
          ...projectsDocxObjects,
          new Paragraph({
            text: 'Education',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
          }),
          ...educationDocxObjects,
          
        ],
      },
    ],
  });
  return doc;
}
export async function markdownToDocx(detailsDto: DetailsDTO, debug = false) {
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
  let doc = fillTemplate(detailsDto);
  const blob = await Packer.toBuffer(doc);
  // Save for debug purposes, ignore if occupied
  try {
    writeFileSync('example.docx', blob);
  } catch (e) {
    console.error(e);
  }
  return blob;
}

