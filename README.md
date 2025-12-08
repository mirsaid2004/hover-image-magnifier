# Hover Image Magnifier

A React component for magnifying images on hover with preview and magnifier modes. This package provides a smooth, interactive way to zoom and preview images when users hover over them.

> ⚠️ **Note**: This package is actively under development. Current version: `0.1.0`

## Installation

```bash
npm install hover-image-magnifier
```

or

```bash
yarn add hover-image-magnifier
```

or

```bash
pnpm add hover-image-magnifier
```

## Peer Dependencies

This package requires React 18.0.0 or higher:

```bash
npm install react@^18.0.0 react-dom@^18.0.0
```

## Basic Usage

```tsx
import { HoverImageMagnifier } from "hover-image-magnifier";

function App() {
  return (
    <HoverImageMagnifier
      src="/path/to/your/image.jpg"
      alt="Description of image"
    />
  );
}
```

## Features

- 🖼️ **Two modes**: Preview mode and Magnifier mode
- 📍 **Smart positioning**: Automatically adjusts placement to stay within viewport
- 🎨 **Customizable**: Full control over styling and dimensions
- ⚡ **Performance**: Optimized with React hooks and efficient rendering
- 📱 **Responsive**: Works seamlessly across different screen sizes

## API Reference

### Props

| Prop             | Type                                           | Default       | Description                                                         |
| ---------------- | ---------------------------------------------- | ------------- | ------------------------------------------------------------------- |
| `src`            | `string`                                       | **required**  | The source URL of the image to display                              |
| `alt`            | `string`                                       | -             | Alternative text for the image                                      |
| `mode`           | `"preview" \| "magnifier"`                     | `"magnifier"` | Display mode: preview shows full image, magnifier shows zoomed area |
| `placement`      | `"right" \| "left" \| "top" \| "bottom"`       | `"right"`     | Initial placement of the preview/magnifier popup                    |
| `width`          | `number`                                       | -             | Width of the main image (in pixels)                                 |
| `height`         | `number`                                       | -             | Height of the main image (in pixels)                                |
| `previewWidth`   | `number`                                       | `400`         | Width of the preview/magnifier popup (in pixels)                    |
| `previewHeight`  | `number`                                       | `400`         | Height of the preview/magnifier popup (in pixels)                   |
| `zoomLevel`      | `number`                                       | `1`           | Zoom level for magnifier mode (1 = no zoom, 2 = 2x zoom, etc.)      |
| `positionOffset` | `[number, number]`                             | -             | Custom offset for popup position `[x, y]`                           |
| `className`      | `string`                                       | -             | CSS class name for the container                                    |
| `classNames`     | `Record<ContainerLayers, string>`              | -             | CSS class names for specific layers (see below)                     |
| `style`          | `React.CSSProperties`                          | -             | Inline styles for the container                                     |
| `styles`         | `Record<ContainerLayers, React.CSSProperties>` | -             | Inline styles for specific layers (see below)                       |

### Container Layers

The `classNames` and `styles` props accept an object with the following keys:

- `container`: The main wrapper div
- `img`: The main image element
- `previewContainer`: The popup container (preview/magnifier)
- `previewImage`: The image inside the popup

## Examples

### Preview Mode

Shows a full preview of the image when hovering:

```tsx
<HoverImageMagnifier
  src="/image.jpg"
  alt="Product image"
  mode="preview"
  previewWidth={500}
  previewHeight={500}
  placement="right"
/>
```

### Magnifier Mode

Shows a zoomed-in view that follows your mouse cursor:

```tsx
<HoverImageMagnifier
  src="/image.jpg"
  alt="Product image"
  mode="magnifier"
  zoomLevel={2.5}
  previewWidth={300}
  previewHeight={300}
  placement="right"
/>
```

### Custom Styling

```tsx
<HoverImageMagnifier
  src="/image.jpg"
  alt="Product image"
  className="my-custom-container"
  classNames={{
    img: "my-image-class",
    previewContainer: "my-preview-class",
    previewImage: "my-preview-image-class",
  }}
  styles={{
    container: { border: "1px solid #ccc" },
    img: { borderRadius: "8px" },
  }}
/>
```

### Different Placements

```tsx
// Top placement
<HoverImageMagnifier
  src="/image.jpg"
  placement="top"
/>

// Left placement
<HoverImageMagnifier
  src="/image.jpg"
  placement="left"
/>

// Bottom placement
<HoverImageMagnifier
  src="/image.jpg"
  placement="bottom"
/>
```

## TypeScript Support

This package is written in TypeScript and includes type definitions. All types are exported for your convenience:

```tsx
import type {
  IHoverImageMagnifier,
  PlacementType,
  BoundaryType,
} from "hover-image-magnifier";
```

## Development Status

This package is currently in active development. The API may change in future versions. We recommend pinning the version in your `package.json`:

```json
{
  "dependencies": {
    "hover-image-magnifier": "0.1.0"
  }
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Repository

[GitHub Repository](https://github.com/mirsaid2004/hover-image-magnifier)
