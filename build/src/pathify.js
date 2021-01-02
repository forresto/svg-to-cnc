/*
// Forked to be standalone with browser DOM
// from https://github.com/stadline/svg-flatten/blob/master/src/pathify.js
*/

const svgns = "http://www.w3.org/2000/svg";
function clone(dom, name) {
  const elName = name || dom.nodeName;
  const el = document.createElementNS(svgns, elName);
  const stroke = dom.getAttribute("stroke");
  if (stroke) {
    el.setAttribute("stroke", stroke);
  }
  const fill = dom.getAttribute("fill");
  if (fill) {
    el.setAttribute("fill", fill);
  }
  const strokeWidth = dom.getAttribute("stroke-width");
  if (strokeWidth) {
    el.setAttribute("stroke-width", strokeWidth);
  }
  const id = dom.getAttribute("id");
  if (id) {
    el.setAttribute("id", id);
  }
  const transform = dom.getAttribute("transform");
  if (transform) {
    el.setAttribute("transform", transform);
  }
  if (elName === "svg") {
    const width = dom.getAttribute("width");
    if (width) {
      el.setAttribute("width", width);
    }
    const height = dom.getAttribute("height");
    if (height) {
      el.setAttribute("height", height);
    }
    const viewBox = dom.getAttribute("viewBox");
    if (viewBox) {
      el.setAttribute("viewBox", viewBox);
    }
  }
  return el;
}

function _convertEllipse(cx, cy, rx, ry) {
  return (
    "M" +
    (cx - rx) +
    "," +
    cy +
    "a" +
    rx +
    "," +
    ry +
    " 0 1,0 " +
    rx * 2 +
    ",0a" +
    rx +
    "," +
    ry +
    " 0 1,0 " +
    rx * -2 +
    ",0"
  );
}

function _convertPoints(points) {
  var path = "";

  for (var i = 0; i < points.length; i += 2) {
    var prefix = path.length ? " " : "M";
    path += prefix + points[i] + "," + points[i + 1];
  }

  return path;
}

function convertGroup(dom) {
  const out = clone(dom);

  Array.from(dom.children).forEach(function (child) {
    out.appendChild(pathify(child));
  });

  return out;
}

function convertCircle(dom) {
  const cx = dom.getAttribute("cx") || 0;
  const cy = dom.getAttribute("cy") || 0;
  const r = dom.getAttribute("r");
  const d = _convertEllipse(cx, cy, r, r);

  const path = clone(dom, "path");
  path.setAttribute("d", d);

  return path;
}

function convertEllipse(dom) {
  const cx = dom.getAttribute("cx") || 0;
  const cy = dom.getAttribute("cy") || 0;
  const rx = dom.getAttribute("rx");
  const ry = dom.getAttribute("ry");
  const d = _convertEllipse(cx, cy, rx, ry);

  const path = clone(dom, "path");
  path.setAttribute("d", d);

  return path;
}

function convertLine(dom) {
  const x1 = dom.getAttribute("x1");
  const y1 = dom.getAttribute("y1");
  const x2 = dom.getAttribute("x2");
  const y2 = dom.getAttribute("y2");
  const d = _convertPoints([x1, y1, x2, y2]);

  const path = clone(dom, "path");
  path.setAttribute("d", d);

  return path;
}

function convertPolygon(dom) {
  const points = dom
    .getAttribute("points")
    .trim()
    .split(/[\s,]+/);
  const d = _convertPoints(points) + "z";

  const path = clone(dom, "path");
  path.setAttribute("d", d);

  return path;
}

function convertPolyline(dom) {
  const points = dom
    .getAttribute("points")
    .trim()
    .split(/[\s,]+/);
  const d = _convertPoints(points);

  const path = clone(dom, "path");
  path.setAttribute("d", d);

  return path;
}

function convertRect(dom) {
  const x = parseFloat(dom.getAttribute("x") || 0);
  const y = parseFloat(dom.getAttribute("y") || 0);
  const width = parseFloat(dom.getAttribute("width"));
  const height = parseFloat(dom.getAttribute("height"));

  const points = [];
  points.push(x, y);
  points.push(x + width, y);
  points.push(x + width, y + height);
  points.push(x, y + height);
  const d = _convertPoints(points) + "z";

  const path = clone(dom, "path");
  path.setAttribute("d", d);

  return path;
}

function pathify(dom) {
  if (dom.nodeName === "svg") {
    return convertGroup(dom);
  } else if (dom.nodeName === "circle") {
    return convertCircle(dom);
  } else if (dom.nodeName === "ellipse") {
    return convertEllipse(dom);
  } else if (dom.nodeName === "line") {
    return convertLine(dom);
  } else if (dom.nodeName === "polygon") {
    return convertPolygon(dom);
  } else if (dom.nodeName === "polyline") {
    return convertPolyline(dom);
  } else if (dom.nodeName === "rect") {
    return convertRect(dom);
  } else if (dom.nodeName === "g") {
    return convertGroup(dom);
  } else if (dom.nodeName === "path") {
    return dom.cloneNode(true);
  } else {
    return dom;
  }
}

export default pathify;
