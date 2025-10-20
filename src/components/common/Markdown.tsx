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

// Configure marked with Prism highlighting; cast to any for type compat
(marked as any).setOptions({
  highlight: (code: string, lang?: string) => {
    if (lang && (Prism as any).languages[lang]) {
      try {
        return Prism.highlight(code, (Prism as any).languages[lang], lang);
      } catch (e) {
        console.error('Prism highlight error:', e);
      }
    }
    return code;
  },
  breaks: true,
} as any);

export default function Markdown(props: MarkdownProps) {
  const html = () => ((marked as any).parse(props.content) as string);
  return <div innerHTML={html()} class="markdown-content" />;
}
