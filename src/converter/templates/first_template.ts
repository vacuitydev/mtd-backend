import { AlignmentType, Document, HeadingLevel, Paragraph } from 'docx';
import { DetailsDTO } from '../dto';
import { sectionToDocx } from '../markdown-to-docx/parser';

export function FirstTemplate(details: DetailsDTO) {
  // A template is free to fill out the underlying tokens however it pleases for each sections
  // For example, a template may choose to ignore paragraphing for the name to make sure it is always a certain heading level

  // This template ignores user paragraphing for the name section
  const nameDocxObjects = sectionToDocx(details.name, {
    ignoreParagraph: true,
  });
  const experienceDocxObjects = sectionToDocx(details.experience);
  const languagesDocxObjects = sectionToDocx(details.languages);
  const projectsDocxObjects = sectionToDocx(details.projects);
  const educationDocxObjects = sectionToDocx(details.education);
  const skillsDocxObjects = sectionToDocx(details.skillset);
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
          new Paragraph({
            text: 'Skillset',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_1,
          }),
          ...skillsDocxObjects,
        ],
      },
    ],
  });
  return doc;
}
