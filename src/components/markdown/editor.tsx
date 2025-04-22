import "@mdxeditor/editor/style.css";

import {
  AdmonitionDirectiveDescriptor,
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  // ChangeAdmonitionType,
  codeBlockPlugin,
  codeMirrorPlugin,
  CodeToggle,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  directivesPlugin,
  imagePlugin,
  InsertAdmonition,
  InsertCodeBlock,
  // InsertFrontmatter,
  InsertImage,
  // InsertSandpack,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  Separator,
  // ShowSandpackInfo,
  StrikeThroughSupSubToggles,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import { headingsPlugin } from "@mdxeditor/editor";

type MarkdownEditorProps = {
  markdown: string;
  diffMarkdown?: string | undefined;
  onChange?: ((markdown: string, initialMarkdownNormalize: boolean) => void) | undefined;
};

const codeBlockLanguages = {
  py: "Python",
  cpp: "C++",
  java: "Java",
  rb: "Ruby",
  go: "Go",
  rust: "Rust",
  js: "JavaScript",
  css: "CSS",
  html: "HTML",
};

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ markdown, diffMarkdown, onChange }) => {
  const onChangeInternal = (markdown: string, initialMarkdownNormalize: boolean): void => {
    // Post-process the markdown to unescape _ in math Latex block
    const mathPattern: RegExp = /\$\$?\n*.*?\n*\$?\$/gm;
    const matches = markdown.matchAll(mathPattern);

    for (const match of matches) {
      // We use split-join because replaceAll is only supported on es2021 or later
      // In addition replace also somehow replaces $$ with $
      const unescaped = match[0].split("\\_").join("_");
      markdown = markdown.split(match[0]).join(unescaped);
    }
    if (onChange) onChange(markdown, initialMarkdownNormalize);
  };

  return (
    <MDXEditor
      markdown={markdown}
      // className="dark-theme dark-editor"
      onChange={onChangeInternal}
      contentEditableClassName="prose max-w-none"
      plugins={[
        headingsPlugin(),
        quotePlugin(),
        listsPlugin(),
        thematicBreakPlugin(),
        tablePlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        diffSourcePlugin({
          diffMarkdown: diffMarkdown,
          viewMode: "rich-text",
          readOnlyDiff: true,
        }),
        codeBlockPlugin({ defaultCodeBlockLanguage: "py" }),
        codeMirrorPlugin({ codeBlockLanguages: codeBlockLanguages }),
        markdownShortcutPlugin(),
        directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <Separator />
              <StrikeThroughSupSubToggles />
              <Separator />
              <ListsToggle />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <CreateLink />
              <InsertImage />
              <Separator />
              <InsertTable />
              <InsertThematicBreak />
              <Separator />
              <InsertCodeBlock />
              <InsertAdmonition />
            </DiffSourceToggleWrapper>
          ),
        }),
      ]}
    />
  );
};
