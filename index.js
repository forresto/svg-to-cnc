import svgpath from 'svgpath';
import pathify from './src/pathify';


export default function svgToCnc (el, options = { consolidate: true, round: 7 }) {

  const { consolidate = true, round = 7 } = options;

  const pathified = pathify(el);

  // Don't want SVG viewBox while measuring
  const toMeasure = pathified.cloneNode(true);
  toMeasure.removeAttribute('width');
  toMeasure.removeAttribute('height');
  toMeasure.removeAttribute('viewBox');

  // Must be in doc to measure with el.getCTM()
  document.body.append(toMeasure);

  // Measure
  const transformedPaths = Array.from(toMeasure.querySelectorAll('path')).map(
    el => {
      const { fill, stroke, strokeWidth } = window.getComputedStyle(el);

      const pathString = el.getAttribute('d');
      const { a, b, c, d, e, f } = el.getCTM();

      const transformed = svgpath(pathString)
        .abs()
        .matrix([a, b, c, d, e, f])
        .round(round)
        .toString();

      return { fill, stroke, strokeWidth, d: transformed };
    }
  );

  // Clean up
  if (toMeasure.parentNode) {
    toMeasure.parentNode.removeChild(toMeasure);
  }
  
  const consolidatedPaths = consolidate
    ? transformedPaths.reduce((consolidated, path, i, paths) => {
        const { fill, stroke, strokeWidth, d } = path;
        const addTo = consolidated.find(
          p =>
            p.fill === path.fill &&
            p.stroke === path.stroke &&
            p.strokeWidth === path.strokeWidth
        );
        if (addTo) {
          addTo.d += ' ' + path.d;
        } else {
          const pathCopy = { fill, stroke, strokeWidth, d };
          consolidated.push(pathCopy);
        }
        return consolidated;
      }, [])
    : transformedPaths;

  // Now we want the original input SVG attributes (w/h/viewBox)
  const outputSVG = el.cloneNode(false);
  consolidatedPaths.forEach(({ fill, stroke, strokeWidth, d }) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', stroke);
    path.setAttribute('fill', fill);
    path.setAttribute('stroke-width', strokeWidth);
    path.setAttribute('d', d);
    outputSVG.appendChild(path);
  });

  return outputSVG;

}


