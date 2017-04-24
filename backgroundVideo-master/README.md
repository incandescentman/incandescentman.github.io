backgroundVideo - v2.0.2
============
## About

### What is backgroundVideo?
backgroundVideo is a vanilla Javascript parallax (optional) plugin that turns your HTML5 `<video>` element into the CSS property `background-size: cover`, scaling to aspect ratio.

### Working Examples
Within the `examples` folder, you will see demonstrations on how to implement the plugin.

*Please note: parallax video is most effective on fixed position videos*

### Browser Support
HTML5 video supported browsers on desktop:
* IE9+ / Edge
* Chrome
* Firefox
* Safari
* Opera

> *Please note this plugin will not work on mobile devices. This is due to restrictions on autoplay and performance. A responsive image is suggested as fallback.*

## How to use

For the most basic implementation, add the following to your `html` document:
```html
<video class="bv-video"></video>
```

Ensuring that you are referencing the `backgroundVideo.js` file in your project, you can then instantiate the plugin by using the following Javascript:

```javascript
const backgroundVideo = new BackgroundVideo('.bv-video', {
  src: [
    'MY/EXAMPLE/PATH/SAMPLE.mp4',
    'MY/EXAMPLE/PATH/SAMPLE.webm'
  ]
});
```

The `src` array is the only mandatory option.

You can also install and use via npm:

```
npm install background-video
```

Please see the examples for how to use the callback options and multiple videos on one page (Note: The examples are written in ES6/ES2015 so these will not work in older browsers e.g. Internet Explorer).

## Options

Option | Type | Default | Description
------ | ---- | ------- | ----------
parallax.effect | number | 1.5 | The intensity of the parallax effect (1: fixed). Number must be >= 1.
preventContextMenu | boolean | false | Prevents the user from viewing the context menu on the video (prevent right-click/secondary-click)
onBeforeReady() | callback | null | Run code before the video is ready
onReady() | callback | null | Run code when the plugin has loaded - e.g. prevent loading flickers (see `examples` folder for useage)


## Dependencies

None :)

## License

Copyright (c) 2016 Sam Linnett

Licensed under the MIT license.
