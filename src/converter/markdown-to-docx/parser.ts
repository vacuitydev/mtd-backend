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
export function aggressiveFlattenArray(arr) {
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

export interface TokenToDocxOptions {
  debug?: boolean;
  bold?: boolean;
  ignoreParagraph?: boolean;
  headingOffset?: number;
  italics?: boolean;
}

export function tokenToDocxObject(
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
export const sectionToDocx = (section, options: TokenToDocxOptions = {}) => {
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


