import katex from "katex";

export const renderKatex = (text: string) => {
  const container = document.createElement("div");
  container.innerHTML = text;
  const katexSpans = container.getElementsByClassName("katex");

  Array.from(katexSpans).forEach((span) => {
    const equation = span.getAttribute("text") || "";
    const showPicker = span.getAttribute("defaultshowpicker") === "true";
    const renderedEquation = katex.renderToString(equation, { displayMode: showPicker });
    const newSpan = document.createElement("span");
    newSpan.innerHTML = renderedEquation;
    span.parentNode?.replaceChild(newSpan, span);
  });

  return container.innerHTML;
};
