# oz-gallery
Simple JS (photo|video|pano)-gallery via the &lt;oz-gallery&gt; custom element

## Features
  - no scripting, just HTML
  - supports images, panoramas, youtube videos
  - works on mobile devices
  - mouse, touch, keyboard control
  - less than 2 kB gzipped

## Usage

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/ondras/oz-gallery/oz-gallery.min.js"></script>

<oz-gallery>
  <a href="large-1.jpg"> <img src="thumbnail-1.jpg" /> </a>
  <a href="large-2.jpg"> <img src="thumbnail-2.jpg" /> </a>
  <a href="large-3.jpg"> <img src="thumbnail-3.jpg" /> </a>
</oz-gallery>
```

### HTML API

- `<oz-gallery loop>` to enable looping (disabled by default)
- `<oz-gallery selector="...">` to specify custom selector (default = `"a"`)
- `<a data-type="image">` shows a (large image)
- `<a data-type="youtube">` shows an embedded YouTube iframe
- `<a data-type="pano">` shows a fullscreen panorama viewer (you need to include the [&lt;little-planet&gt; custom element](https://github.com/ondras/little-planet/))

### DOM API

```js
let ozg = document.querySelector("oz-gallery")
ozg.selector = "a"      // default
console.log(ozg.loop)   // true/false

ozg.show(3)             // open image #3
console.log(ozg.index)  // 3
ozg.close()
```

### DOM Events

```js
let ozg = document.querySelector("oz-gallery")

ozg.addEventListener("change", ...)  // index change
ozg.addEventListener("close", ...)   // gallery has been closed
```
