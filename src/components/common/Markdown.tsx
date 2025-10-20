import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';

interface MarkdownProps {
  content: string;
}

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && Prism.languages[lang]) {
      try {
        return Prism.highlight(code, Prism.languages[lang], lang);
      } catch (e) {
        console.error('Prism highlight error:', e);
      }
    }
    return code;
  },
  breaks: true,
});

export default function Markdown(props: MarkdownProps) {
  const html = () => marked(props.content);

  return <div innerHTML={html()} class="markdown-content" />;
}
