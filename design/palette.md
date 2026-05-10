# datos.do — Color Palette

## Base

| Role | Hex | Usage |
|---|---|---|
| Text primary | `#1a1a1a` | Headlines, body copy |
| Text secondary | `#555555` | Subheds, bylines, captions |
| Text muted | `#888888` | Axis labels, chart notes |
| Border light | `#e5e5e5` | Dividers, axis lines |
| Background | `#ffffff` | Page background |
| Background alt | `#f7f7f5` | Section backgrounds, callouts |

## Story accents (one per story)

| Story | Name | Hex | Usage |
|---|---|---|---|
| 4pct-moment | Crimson | `#c0392b` | Highlighted line, annotations, event markers |
| pisa-trajectory | Indigo | `#2c4f8c` | DR highlighted line, slope labels |

## Chart palette

| Role | Hex |
|---|---|
| DR highlight | Story accent (see above) |
| Other countries | `#c8c8c8` |
| OECD reference | `#aaaaaa` (dashed) |
| Annotation line | `#333333` |
| Shaded region fill | `rgba(192, 57, 43, 0.08)` (spending) |
| Positive change | `#2c7a4b` |
| Negative change | `#c0392b` |

## Type scale (reference — enforced in style.css)

| Element | Family | Size | Weight |
|---|---|---|---|
| Headline h1 | Georgia, serif | `clamp(1.75rem, 4vw, 2.5rem)` | 700 |
| Headline h2 | Georgia, serif | `clamp(1.25rem, 3vw, 1.75rem)` | 700 |
| Subhed | system-ui, sans-serif | `1.1rem` | 400 |
| Body | system-ui, sans-serif | `1rem` | 400 |
| Chart label | system-ui, sans-serif | `0.75rem` | 400 |
| Annotation | system-ui, sans-serif | `0.7rem` | 400 |
| Caption | system-ui, sans-serif | `0.8rem` | 400 |
