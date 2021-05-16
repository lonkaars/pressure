<h1 align="center">
<img src="./logo.png" height=48></img><br/>
pressure
</h1>

Pressure takes a presentation in video format, and lets you split it into
slides. This allows you to create custom animations and designs in software you
love, and present it to the world with ease.

## roadmap

- [x] working demo
- [ ] standalone web editor
- [ ] backend in rust
- [ ] remote control with phone
- [ ] presenter view

## integration

I'm not sure if these integrations are even possible, but i'll update these
when I'm working on them/are finished:

- **PowerPoint plugin/embed**  
  Would allow embedding a slideshow-style video inside your existing PowerPoint
  presentation.
- **Adobe After Effects plugin**  
  Would allow adding markers in your composition timeline that export to a
  timeline.json file. Maybe also a feature where you could import recorded
  presentation timings for adding a voice-over and re-exporting the video as a
  standalone video.
- **Manim add-on library**
  Would allow adding of something like `pressure.slide()` or
  `pressure.slide('speedChange', 0.7)` to your Manim scene source and export it
  using a simple python cli script, or alongside the regular Manim renderer if
  that's possible.

## designs

See
[figma](https://www.figma.com/file/QDzMck2G5KZFqRvVsi3DSU/pressure?node-id=0%3A1)
link. I try to follow Google's [Material design
guidelines](https://material.io/design/guidelines-overview) most of the time.

