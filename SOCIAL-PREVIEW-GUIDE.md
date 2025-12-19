# Social Preview Images Guide

## Image Specifications

### Required Dimensions
- **Recommended Size**: 1200 x 630 pixels
- **Minimum Size**: 600 x 314 pixels
- **Aspect Ratio**: 1.91:1
- **File Format**: JPG or PNG
- **Max File Size**: 8 MB (5 MB recommended for faster loading)

### Platform-Specific Requirements

#### Facebook/LinkedIn (Open Graph)
- 1200 x 630 px (recommended)
- Displays at max 1200 x 630 px
- Images larger than 1200 x 630 will be scaled down

#### Twitter
- 1200 x 628 px (recommended for summary_large_image)
- Min: 300 x 157 px
- Max: 4096 x 4096 px

## Required Images for Website

### Main Pages
1. **Homepage** - `/public/preview.jpg` ✅ (exists)
   - Title: "Digital Back Office - Enterprise AI & Data Consulting"
   - Show: Logo, tagline, key services

2. **About Us** - `/public/assets/images/about-us/about-preview.jpg`
   - Title: "About Digital Back Office"
   - Show: Team or company values

3. **Contact Us** - `/public/assets/images/contact-us/contact-preview.jpg`
   - Title: "Contact Us - Get Your Free AI Consultation"
   - Show: Contact CTA, phone/email

### Service Pages
4. **AI Solutions** - `/public/assets/images/services/ai-solutions-preview.jpg`
   - Title: "AI Solutions & RAG Implementation"
   - Show: AI/ML icons, agentic workflows visual

5. **Data Strategy** - `/public/assets/images/services/data-strategy-preview.jpg`
   - Title: "Data Strategy Consulting"
   - Show: Strategy diagram, architecture

6. **Data Engineering** - `/public/assets/images/services/data-engineering-preview.jpg`
   - Title: "Data Engineering Services"
   - Show: Pipeline visual, data flow

7. **Data Science** - `/public/assets/images/services/data-science-preview.jpg`
   - Title: "Data Science & Machine Learning"
   - Show: ML models, analytics graphs

### Blog Posts
Each blog post should ideally have its own preview image based on the featured image.

## Design Guidelines

### Branding
- Use company colors consistently
- Include Digital Back Office logo
- Maintain brand font (Arimo)
- Dark theme consistent with website

### Content
- **Title**: Large, readable (min 60px font)
- **Subtitle/Description**: Supporting text (min 40px font)
- **Visuals**: Icons, illustrations, or relevant imagery
- **Safe Zone**: Keep important content in center 1200 x 600 px area

### Text
- Use high contrast (white text on dark background)
- Avoid small text (won't be readable in preview)
- Keep text concise (2-3 lines max)
- No important info at edges (can be cropped)

## Creating Images

### Tools
- **Canva** (easiest): Use "Facebook Post" or "Facebook Cover" template
- **Figma** (professional): Create 1200 x 630 px frame
- **Photoshop**: Standard size, 72 DPI, RGB color mode
- **Online Tools**: 
  - https://www.opengraph.xyz/
  - https://bannerbear.com/
  - https://metatags.io/

### Quick Template

```
[Logo] Digital Back Office

[MAIN TITLE]
Large, Bold Text

[Subtitle/Description]
Supporting information

[Icon/Visual Element]
```

## Testing Social Previews

### Facebook
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Clear cache and test URL

### Twitter
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- Test with tweet preview

### LinkedIn
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/
- Paste URL to see preview

### General
- Open Graph Checker: https://www.opengraph.xyz/url/
- Social Preview Tools: https://metatags.io/

## Current Implementation Status

✅ Meta tags added to Layout.astro:
- Open Graph tags with image dimensions
- Twitter Card tags
- Image alt text
- Secure URLs

✅ Pages with preview images configured:
- Homepage: /preview.jpg
- About Us: /assets/images/about-us/about-preview.jpg
- Contact Us: /assets/images/contact-us/contact-preview.jpg
- AI Solutions: /assets/images/services/ai-solutions-preview.jpg
- Data Strategy: /assets/images/services/data-strategy-preview.jpg
- Data Engineering: /assets/images/services/data-engineering-preview.jpg
- Data Science: /assets/images/services/data-science-preview.jpg

⚠️ TODO: Create actual image files for new preview images

## Next Steps

1. **Create Preview Images**: Use Canva or Figma to create the 7 required images
2. **Upload Images**: Place in correct directories as specified above
3. **Test**: Use Facebook Debugger and Twitter Card Validator
4. **Optimize**: Compress images to reduce file size while maintaining quality
5. **Update**: Add preview images for blog posts
