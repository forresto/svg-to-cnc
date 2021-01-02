# svg-to-cnc

Compiles SVG paths for CNC software down basic paths. Each combination of stroke and fill becomes one path element. This makes it easier to attach them in Cricut, and then set the tool for each layer.

Demo, with SVG file input: https://observablehq.com/@forresto/svg-to-cnc

## Features

* Converts all shapes to paths
* Bakes all nested transformations into the path
* Removes grouping
* Combines all paths with the same stroke/stroke-width/fill into one path

## Why

Cricut's software chokes with some indeterminate combination of element count, groups, and transforms. Issues that I've noticed:

- With ~100 groups of elements: "attach" action makes the app freeze
- With many cut and draw elements: there is no way to maintain those on import(?), so it's a pain to select each one to set the pen color / tool
- \`transform="translate(-10, 0)"\` switches x and y, moving elements up instead of left 😶
- Some combination of \`translate\` and \`scale\` gets... lost... in _translation_ 😏

Cricut's software and file format are closed-source, so I was losing hope that I could work with my generative designs. Then, I got this idea. It seems like it can handle small numbers of big paths. What if I brute-force the design down to one path per tool?

~~File size is much larger.~~ _(Edit: fixed that with smarter flattening.)_ Cricut doesn't choke. Success! (Seems like they could make this an option when importing. 🤔)

Tested with a [moderately complex SVG](https://observablehq.com/@forresto/moon-grid), and it's much easier to work with.

## Cricut/SVG Tips

1 inch = 72px, so you can design with a function like this:

~~~js
function inch (n) { return n * 72 };

inch(8.5); // 612
inch(2); // 144
inch(1/2); // 36
inch(1/4); // 18
~~~

If designing for a specific size paper, make **registration marks** in a color that you won't use. Make them 1/4 inch from each corner. This should make the output centered as you expect. When Cricut asks you to insert that color pen, press "Go" without a pen in the holder.

Set SVG width and height to inches, and viewBox to pixels:

~~~svg
<svg width="8.5in" height="11in" viewBox="0 0 612 792">
~~~

## Todo

- [x] Close circle, rect
- [x] Support more shapes
- [x] UI
- [x] Be smarter about how to compile the paths 🤷‍♀️
- [x] Fix \`viewBox\` breaks measuring
- [ ] Fix unneeded penup / pendown (\`M\`)
- [ ] Option to not consolidate paths (only group by "tool")
- [ ] Nix fills?
