import { component$ } from "@builder.io/qwik";

const HighlightedText = component$((props: { text: string; query: string }) => {
  if (!props.query) {
    return <p>{props.text}</p>;
  }

  const lowercaseQuery = props.query.toLowerCase();
  const lowercaseText = props.text.toLowerCase();

  if (!lowercaseText.includes(lowercaseQuery)) {
    return null; // filter out options that do not include the query
  }

  const startIndex = lowercaseText.indexOf(lowercaseQuery);
  const endIndex = startIndex + props.query.length;

  const beforeQuery = props.text.slice(0, startIndex);
  const highlightedQuery = props.text.slice(startIndex, endIndex);
  const afterQuery = props.text.slice(endIndex);

  return (
    <p>
      {beforeQuery}
      <strong>{highlightedQuery}</strong> {/* highlight the query in bold */}
      {afterQuery}
    </p>
  );
});

export default HighlightedText;