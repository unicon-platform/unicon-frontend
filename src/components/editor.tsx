import "reactjs-tiptap-editor/style.css";
import "katex/dist/katex.min.css";
import "prism-code-editor-lightweight/layout.css";
import "prism-code-editor-lightweight/themes/github-dark.css";

import RichTextEditor, { BaseKit } from "reactjs-tiptap-editor";
// import { Attachment } from 'reactjs-tiptap-editor/attachment';
import { Blockquote } from "reactjs-tiptap-editor/blockquote";
import { Bold } from "reactjs-tiptap-editor/bold";
import {
  // BubbleMenuTwitter,
  BubbleMenuKatex,
  // BubbleMenuExcalidraw,
  // BubbleMenuMermaid,
  // BubbleMenuDrawer
} from "reactjs-tiptap-editor/bubble-extra";
import { BulletList } from "reactjs-tiptap-editor/bulletlist";
import { Clear } from "reactjs-tiptap-editor/clear";
import { Code } from "reactjs-tiptap-editor/code";
import { CodeBlock } from "reactjs-tiptap-editor/codeblock";
import { Color } from "reactjs-tiptap-editor/color";
// import { Drawer } from 'reactjs-tiptap-editor/drawer';
import { Document } from "reactjs-tiptap-editor/document";
import { Emoji } from "reactjs-tiptap-editor/emoji";
// import { Excalidraw } from 'reactjs-tiptap-editor/excalidraw';
// import { ExportPdf } from 'reactjs-tiptap-editor/exportpdf';
// import { ExportWord } from 'reactjs-tiptap-editor/exportword';
import { FontFamily } from "reactjs-tiptap-editor/fontfamily";
import { FontSize } from "reactjs-tiptap-editor/fontsize";
import { FormatPainter } from "reactjs-tiptap-editor/formatpainter";
import { Heading } from "reactjs-tiptap-editor/heading";
import { Highlight } from "reactjs-tiptap-editor/highlight";
import { History } from "reactjs-tiptap-editor/history";
import { HorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
// import { Iframe } from 'reactjs-tiptap-editor/iframe';
import { Image } from "reactjs-tiptap-editor/image";
// import { ImageGif } from 'reactjs-tiptap-editor/imagegif';
// import { ImportWord } from 'reactjs-tiptap-editor/importword';
import { Indent } from "reactjs-tiptap-editor/indent";
import { Italic } from "reactjs-tiptap-editor/italic";
import { Katex } from "reactjs-tiptap-editor/katex";
import { LineHeight } from "reactjs-tiptap-editor/lineheight";
import { Link } from "reactjs-tiptap-editor/link";
// import { Mention } from 'reactjs-tiptap-editor/mention';
// import { Mermaid } from 'reactjs-tiptap-editor/mermaid';
import { MoreMark } from "reactjs-tiptap-editor/moremark";
import { ColumnActionButton } from "reactjs-tiptap-editor/multicolumn";
import { OrderedList } from "reactjs-tiptap-editor/orderedlist";
import { SearchAndReplace } from "reactjs-tiptap-editor/searchandreplace";
import { SlashCommand } from "reactjs-tiptap-editor/slashcommand";
import { Strike } from "reactjs-tiptap-editor/strike";
import { Table } from "reactjs-tiptap-editor/table";
import { TableOfContents } from "reactjs-tiptap-editor/tableofcontent";
import { TaskList } from "reactjs-tiptap-editor/tasklist";
import { TextAlign } from "reactjs-tiptap-editor/textalign";
import { TextDirection } from "reactjs-tiptap-editor/textdirection";
import { TextUnderline } from "reactjs-tiptap-editor/textunderline";
// import { Twitter } from 'reactjs-tiptap-editor/twitter';
import { Video } from "reactjs-tiptap-editor/video";

const mainExtensions = [BaseKit, Document, History, SearchAndReplace, SlashCommand];

const formattingExtensions = [
  FormatPainter.configure({ spacer: true }),
  Color,
  Clear,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  MoreMark,
  Highlight,
];

const structureExtensions = [
  BulletList.configure({ spacer: true }),
  OrderedList,
  TaskList.configure({
    taskItem: {
      nested: true,
    },
  }),
];

const coreContentExtensions = [
  HorizontalRule.configure({ spacer: true }),
  Blockquote,
  Code,
  CodeBlock,
  Table,
  Katex,
  Link,
];

const additionalContentExtensions = [Emoji.configure({ spacer: true }), TableOfContents, ColumnActionButton];

const mediaExtensions = [
  Image.configure({
    spacer: true,
    resourceImage: "link",
  }),
  Video.configure({
    resourceVideo: "link",
  }),
];

const textExtensions = [
  TextAlign.configure({ spacer: true, types: ["heading", "paragraph"] }),
  Indent,
  LineHeight,
  TextDirection,
  Heading.configure({
    // This is somehow required by TextAlign, so we use it but we hide the toolbar
    toolbar: false,
  }),
];

const typographyExtensions = [FontFamily.configure({ spacer: true }), Heading, FontSize];

const basicExtensions = [...mainExtensions, ...formattingExtensions, ...structureExtensions, ...coreContentExtensions];

const advancedExtensions = [...basicExtensions, ...additionalContentExtensions, ...mediaExtensions, ...textExtensions];

const fullExtensions = [...advancedExtensions, ...typographyExtensions];

enum EditorType {
  basic = "basic",
  advanced = "advanced",
  full = "full",
}

const editorTypeExtensions = {
  [EditorType.basic]: basicExtensions,
  [EditorType.advanced]: advancedExtensions,
  [EditorType.full]: fullExtensions,
};

interface RichTextEditorComponentProps {
  content: string;
  type: EditorType;
  onChangeContent: (value: string) => void;
}

export const RichTextEditorComponent: React.FC<RichTextEditorComponentProps> = ({ content, type, onChangeContent }) => {
  return (
    <RichTextEditor
      output="html"
      dark={true}
      content={content}
      onChangeContent={onChangeContent}
      extensions={editorTypeExtensions[type]}
      bubbleMenu={{
        render({ extensionsNames, editor, disabled }, bubbleDefaultDom) {
          return (
            <>
              {bubbleDefaultDom}

              {extensionsNames.includes("katex") ? (
                <BubbleMenuKatex disabled={disabled} editor={editor} key="katex" />
              ) : null}
            </>
          );
        },
      }}
    />
  );
};

interface RichTextEditorProps {
  content: string;
  onChangeContent: (content: string) => void;
}

export const RichTextEditorBasic: React.FC<RichTextEditorProps> = ({ content, onChangeContent }) => {
  return <RichTextEditorComponent content={content} onChangeContent={onChangeContent} type={EditorType.basic} />;
};

export const RichTextEditorAdvanced: React.FC<RichTextEditorProps> = ({ content, onChangeContent }) => {
  return <RichTextEditorComponent content={content} onChangeContent={onChangeContent} type={EditorType.advanced} />;
};

export const RichTextEditorFull: React.FC<RichTextEditorProps> = ({ content, onChangeContent }) => {
  return <RichTextEditorComponent content={content} onChangeContent={onChangeContent} type={EditorType.full} />;
};
