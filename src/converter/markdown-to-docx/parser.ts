import { AlignmentType, UnderlineType } from 'docx';
import { marked } from 'marked';
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

function flattenArray(arr) {
  // Create an empty array to hold the flattened result
  const flattened = [];

  // Iterate through the elements of the input array
  for (const element of arr) {
    if (Array.isArray(element)) {
      // If the element is an array, spread its contents into the flattened array
      flattened.push(...element);
    } else {
      // If the element is not an array, simply push it to the flattened array
      flattened.push(element);
    }
  }

  return flattened;
}

function tokenToDocxObject(
  token,
  options:
    | undefined
    | {
        debug?: boolean;
        bold?: boolean;
        ignoreParagraph?: boolean;
        headingOffset?: number;
        italics?: boolean;
      } = {
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
      children = flattenArray(children);
      let result;
      if (options.debug) console.log('children', children);

      if (options.ignoreParagraph) {
        return flattenArray(children);
      } else {
        const result = new Paragraph({
          children,
        });
        return result;
      }
    case 'text':
      if (token.tokens !== undefined) {
        return token.tokens.map((_token, index) =>
          tokenToDocxObject(_token, {...options }),
        );
      }
      return new TextRun({
        text: token.text,
        bold: options.bold,
        italics: options.italics,
      });
    case 'em':
      return flattenArray( token.tokens.map((_token, index) =>
        tokenToDocxObject(_token, { italics: true, ...options }),
      ));
    case 'strong':
      return flattenArray(token.tokens.map((_token, index) =>
        tokenToDocxObject(_token, { bold: true, ...options }),
      ));
    case 'heading':
      const headingLevel: number = token.depth + options.headingOffset ?? 0;
      return new Paragraph({
        heading: `Heading${headingLevel}` as HeadingLevel,
        children: flattenArray(token.tokens.map((_token) =>
          tokenToDocxObject(_token, options),
        )),
      });
    case 'list':
      // return token.items.map((v,i)=>new TextRun({text:v}))
      const resultsArray = token.items.map((_token, index) =>
        tokenToDocxObject(_token, options),
      );

      return flattenArray(resultsArray);
    case 'list_item':
      const listItems = flattenArray(token.tokens.map((_token) =>
      tokenToDocxObject(_token, options)
    ))
    const reflatted = flattenArray(listItems)
      console.log("List items", listItems)
      console.log("Reflatted list items", reflatted)
      return new Paragraph({
        bullet: {
          level: 0,
        },
        children:  reflatted
      });
    case 'space':
      return new Paragraph({ children: [] });
    default:
      break;
  }
}
const nameToDocx = (name) => {
  const nameTokens = marked.lexer(name);
  let nameDocxObjects = nameTokens.map((token, index) => {
    return tokenToDocxObject(token, { ignoreParagraph: true, debug: false });
  });
  nameDocxObjects = flattenArray(nameDocxObjects);
  return nameDocxObjects;
};
const experienceToDocx = (experience) => {
  const experienceTokens = marked.lexer(experience);
  console.log('Experience tokens', experienceTokens);
  let experienceDocxObjects = experienceTokens.map((token, index) => {
    return tokenToDocxObject(token, { ignoreParagraph: false, debug: true });
  });
  return (experienceDocxObjects = flattenArray(experienceDocxObjects));
};
export async function markdownToDocx(name, experience, debug = false) {
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
  const nameDocxObjects = nameToDocx(name);
  const experienceDocxObjects = experienceToDocx(experience);

  let customText = nameDocxObjects.concat(experienceDocxObjects);
  customText = flattenArray(customText);
  if (debug) console.log('addendum', customText);
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
        properties: {},
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
          ...customText,
        ],
      },
    ],
  });
  const blob = await Packer.toBuffer(doc);
  // Save for debug purposes, ignore if occupied
  try {
    writeFileSync('example.docx', blob);
  } catch (e) {
    console.error(e);
  }
  return blob;
}

export async function patchMarkdownToDocx(name, experience) {
  console.log('Name', name, 'Experience', experience);
  const nameDocxObjects = nameToDocx(name);
  const experienceDocxObjects = experienceToDocx(experience);

  console.log('Experience docx');
  console.dir(experienceDocxObjects);

  const patched = await patchDocument(
    readFileSync('_conversion/templates/1.docx'),
    {
      patches: {
        candidate_name: {
          type: PatchType.PARAGRAPH,
          children: [...nameDocxObjects],
        },
        experience: {
          type: PatchType.DOCUMENT,
          children: [experienceDocxObjects[0]],
        },
      },
    },
  );
  // Write to a temporary file, if it fails do nothing
  try {
    writeFileSync('patched.docx', patched);
  } catch (e) {
    console.error(e);
  }
  return patched;
}
