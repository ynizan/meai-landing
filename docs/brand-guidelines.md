# InTouch123 Implementation Guide v2

## ⚠️ Critical: Logo is an SVG Graphic
The InTouch123 logo mark is a custom SVG — never render it as text. Use the exact SVGs below.

### Logo Mark — Dark Background (White container, Black "1")
```svg
<svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFFFFF"/>
  <path d="M22 14L28 11V37H22V18L18 20V14H22Z" fill="#0D0D0D"/>
</svg>
```

### Logo Mark — Light Background (Black container, Gold "1")
```svg
<svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="40" height="40" rx="8" fill="#0D0D0D"/>
  <path d="M22 14L28 11V37H22V18L18 20V14H22Z" fill="#D4A574"/>
</svg>
```

### Full Horizontal Logo — Dark Background
```html
<div style="display: flex; align-items: center; gap: 8px;">
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFFFFF"/>
    <path d="M22 14L28 11V37H22V18L18 20V14H22Z" fill="#0D0D0D"/>
  </svg>
  <span style="font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 24px; color: #FFFFFF; letter-spacing: -0.02em;">InTouch123</span>
</div>
```

### Full Horizontal Logo — Light Background
```html
<div style="display: flex; align-items: center; gap: 8px;">
  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#0D0D0D"/>
    <path d="M22 14L28 11V37H22V18L18 20V14H22Z" fill="#D4A574"/>
  </svg>
  <span style="font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 24px; color: #0D0D0D; letter-spacing: -0.02em;">InTouch123</span>
</div>
```

### Stacked Logo — Dark Background
```html
<div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
  <svg width="80" height="80" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#FFFFFF"/>
    <path d="M22 14L28 11V37H22V18L18 20V14H22Z" fill="#0D0D0D"/>
  </svg>
  <span style="font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 18px; color: #FFFFFF; letter-spacing: -0.02em;">InTouch123</span>
</div>
```

### Stacked Logo — Light Background
```html
<div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
  <svg width="80" height="80" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="40" height="40" rx="8" fill="#0D0D0D"/>
    <path d="M22 14L28 11V37H22V18L18 20V14H22Z" fill="#D4A574"/>
  </svg>
  <span style="font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 18px; color: #0D0D0D; letter-spacing: -0.02em;">InTouch123</span>
</div>
```

## Color Palette
Use only the two brand colors plus neutrals.

```css
:root {
  /* Primary */
  --color-black: #0D0D0D;
  --color-gold: #D4A574;

  /* Neutrals */
  --color-white: #FFFFFF;
  --color-gray-100: #F5F5F5;
  --color-gray-500: #737373;
  --color-gray-700: #404040;
}
```

## Buttons (Gold Outline + Solid Gold)
Use solid gold for primary actions and gold outline for secondary/badge styles.

```css
.btn-primary {
  background: #D4A574;
  color: #0D0D0D;
  border: none;
  border-radius: 8px;
  padding: 16px 32px;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 16px;
}

.btn-secondary {
  background: transparent;
  color: #D4A574;
  border: 2px solid #D4A574;
  border-radius: 8px;
  padding: 14px 30px;
  font-family: 'Manrope', sans-serif;
  font-weight: 600;
  font-size: 16px;
}

.btn-badge {
  background: transparent;
  color: #D4A574;
  border: 2px solid #D4A574;
  border-radius: 9999px;
  padding: 10px 20px;
  font-family: 'Manrope', sans-serif;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

## Typography
Load Manrope for display/CTA text and IBM Plex Serif for body copy.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
:root {
  --font-display: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'IBM Plex Serif', Georgia, serif;
}
```

## Quick Checklist
- Replace any text "1" logo with the SVG marks
- Remove all green; use gold (#D4A574) for emphasis instead
- Keep palette to #0D0D0D, #D4A574, #FFFFFF, #F5F5F5, #737373, #404040
- Headlines/buttons: Manrope; body: IBM Plex Serif
