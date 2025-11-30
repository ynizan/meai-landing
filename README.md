# Me.AI Landing Page

A static validation landing page for Me.AI - a premium AI relationship management service. This page captures user intent and information to validate willingness to pay at $100-500/month through a phased onboarding flow.

**Important:** This is a validation page only. No payment processing is implemented.

## Tech Stack

- Pure HTML/CSS/JS (no framework, no build step)
- Formspree for form submissions
- Plausible for analytics
- Cloudflare Pages for hosting

## Project Structure

```
/meai-landing
├── index.html          # Main landing page with all phases
├── thank-you.html      # Post-submission confirmation page
├── css/
│   └── styles.css      # All styles (dark theme, responsive)
├── js/
│   └── main.js         # Form handling, analytics, interactivity
├── images/             # Optimized assets (add og-image.png here)
├── robots.txt          # Search engine directives
├── sitemap.xml         # Sitemap for SEO
├── _headers            # Cloudflare security headers
└── README.md           # This file
```

## Local Development

Start a local server to test the page:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open http://localhost:8000 in your browser.

## Configuration

### Formspree Setup

1. Create two forms at [Formspree](https://formspree.io):
   - **Full Reservation Form**: For complete user registrations
   - **Waitlist Form**: For email-only captures

2. Replace the placeholder IDs in the code:
   - In `index.html`, find `YOUR_FULL_FORM_ID` and replace with your full form ID
   - In `index.html`, find `YOUR_WAITLIST_FORM_ID` and replace with your waitlist form ID

### Plausible Analytics

1. Set up your site in [Plausible](https://plausible.io) with domain `intouch123.com`
2. The domain is already configured in both HTML files

### Domain Configuration

The domain `intouch123.com` is configured in:
- `index.html` - canonical URL, Open Graph URLs, Plausible
- `thank-you.html` - share URLs, Plausible
- `robots.txt` - sitemap URL
- `sitemap.xml` - page URLs

## A/B Testing

The hero section supports two variants for A/B testing:

- **Variant A** (default): "When was the last time you reached out... just because?"
- **Variant B**: "Your network is tired of hearing about your launches"

To test variants, add a URL parameter:
- Variant A: `https://your-domain.com/` or `https://your-domain.com/?v=a`
- Variant B: `https://your-domain.com/?v=b`

The variant is automatically included in form submissions for analysis.

## Deployment to Cloudflare Pages

### Option 1: GitHub Integration

1. Push this repository to GitHub
2. Log in to Cloudflare Dashboard
3. Go to Pages > Create a project > Connect to Git
4. Select your repository
5. Configure:
   - Build command: (leave empty)
   - Build output directory: `/`
6. Deploy

### Option 2: Direct Upload

1. Go to Cloudflare Pages > Create a project > Direct Upload
2. Drag and drop all files from this directory
3. Deploy

### Custom Domain

1. In Cloudflare Pages, go to your project settings
2. Add a custom domain
3. Update DNS records as instructed

## Performance Targets

- PageSpeed Score: 95+
- LCP: < 2.0s
- Total Page Size: < 500KB

The page uses:
- System fonts only (no external font loading)
- Minimal JS (< 5KB)
- Inline critical CSS
- No external dependencies except Plausible

## Analytics Events

The following custom events are tracked with Plausible:

| Event | Description |
|-------|-------------|
| `Hero_CTA_Click` | User clicks "See if Me.AI is right for you" |
| `Phase1_Started` | First interaction with qualification form |
| `Phase1_Completed` | User clicks "See my plan" |
| `Pricing_Viewed` | Pricing section becomes visible |
| `Viral_Toggle_On` | User enables viral referral option |
| `Viral_Toggle_Off` | User disables viral referral option |
| `Reserve_Clicked` | User clicks "Reserve my spot" |
| `Waitlist_Submitted` | Email-only form submitted |
| `Full_Reservation_Submitted` | Complete reservation form submitted |
| `Share_LinkedIn_Clicked` | User clicks LinkedIn share button |
| `Share_Twitter_Clicked` | User clicks Twitter/X share button |

## Placeholders to Replace

Before going live, replace these placeholders:

| Placeholder | Location | Replace With |
|-------------|----------|--------------|
| `YOUR_FULL_FORM_ID` | index.html | Formspree form ID for reservations |
| `YOUR_WAITLIST_FORM_ID` | index.html | Formspree form ID for waitlist |
| `intouch123.com` | Multiple files | Already configured |
| `og-image.png` | images/ | Create and add this asset (1200x630px) |

## Browser Support

Tested and works in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 14+)
- Chrome for Android

## License

Proprietary - Me.AI
