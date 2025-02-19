# Selection Styling Demo

<img src="../../resources/image/selectionstyling.png" alt="demo-thumbnail" height="320"/>

[You can also run this demo online](https://live.yworks.com/demos/style/selectionstyling/index.html).

# Selection Styling Demo

The Selection Styling demo shows customized selection painting of nodes, edges and labels by decorating these items with a corresponding style.

Customizing the painting of the focus indicator and the highlighting is possible as well but not shown in this demo.

## Things to Try

- Switch between the default visualization and the _Custom Selection Decoration_ of nodes, edges and labels with the toolbar buttons.
- Test the different _Zoom Modes_ for the custom selection rendering.

## Zoom Mode

Specifies how the zoom level affects the custom selecting painting.

Zoom with graph

The visual is rendered in the world coordinate space and scales with the zoom level like a regular graph item visualization, for example a node style.

Always the same size

The visual is rendered in the view coordinate space and doesn't scale with the zoom level, similar to the default node resize handles, for example.

Mixed

Uses world coordinates for zoom level ≥ 1 and view coordinates for zoom level < 1.
