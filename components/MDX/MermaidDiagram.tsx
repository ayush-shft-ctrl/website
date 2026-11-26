import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

interface MermaidDiagramProps {
  graph: string;
}

/**
 * @description Renders a diagram from a graph definition string using Pele.
 *
 * Pele is loaded via dynamic import to keep initial bundle light.
 *
 * @param {MermaidDiagramProps} props - Component props.
 * @param {string} props.graph - Diagram graph definition to render.
 */
export default function MermaidDiagram({
  graph,
}: Readonly<MermaidDiagramProps>) {
  const [svg, setSvg] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const trimmedGraph = graph.trim();
    if (!trimmedGraph) {
      return;
    }

    let mounted = true;

    const render = async () => {
      try {
        const { render: renderPele } = await import('pele');
        const { svg: rendered } = renderPele(trimmedGraph);
        const sanitized = DOMPurify.sanitize(rendered, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });

        if (mounted) {
          setSvg(sanitized);
        }
      } catch {
        if (mounted) {
          setHasError(true);
        }
      }
    };

    render();

    return () => {
      mounted = false;
    };
  }, [graph]);

  if (hasError) {
    return (
      <p className='text-red-500 text-sm'>Unable to render the diagram.</p>
    );
  }

  return (
    <div
      className='pele-diagram-container'
      dangerouslySetInnerHTML={{ __html: svg ?? '' }}
    />
  );
}
