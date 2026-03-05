/**
 * SEO Documentation — "Learn more" popup content for each section.
 * Each entry matches the DocOverlay format: { doc: { title, sections: [{ heading, body }] } }
 */

export const SEO_DOCS = {
  audit: {
    text: 'SEO Audit',
    doc: {
      title: 'SEO Audit — How It Works',
      sections: [
        {
          heading: 'What does the SEO Audit check?',
          body: 'The SEO Audit runs 30+ deterministic checks across 5 categories: Keyword Optimization, Readability & UX, URL & Technical, Social & Sharing, and Image Optimization.\n\nIt scores your page out of 100 points based on on-page SEO factors that you can directly control. These checks do NOT overlap with the AEO Analyzer — they cover complementary areas.',
        },
        {
          heading: 'How is the score calculated?',
          body: 'Each check earns points:\n\n- Pass: Full points (green checkmark)\n- Partial: Some points (yellow indicator)\n- Fail: Zero points (red X)\n\nThe overall score = (points earned / max possible) x 100.\n\nCategories are weighted by importance:\n- Keyword Optimization: 25 points\n- Readability & UX: 20 points\n- URL & Technical: 20 points\n- Social & Sharing: 20 points\n- Image Optimization: 15 points',
        },
        {
          heading: 'Priority Issues vs Quick Wins',
          body: 'Priority Issues are failing checks sorted by impact (highest point value first). Fix these for the biggest score improvement.\n\nQuick Wins are partial checks that need small improvements. These are often easy fixes like adding a missing alt text or tweaking a meta description.',
        },
        {
          heading: 'AEO Score cross-reference',
          body: 'The AEO Score shown alongside your SEO Score comes from the AEO Analyzer. It covers: title/meta/headings quality, schema markup, robots.txt AI crawler access, sitemap, structured data, and more.\n\nTogether, the SEO Score + AEO Score give you a complete picture of your page\'s search optimization.',
        },
      ],
    },
  },

  onpage: {
    text: 'On-Page SEO',
    doc: {
      title: 'On-Page SEO — Keyword & Readability Analysis',
      sections: [
        {
          heading: 'How is the target keyword detected?',
          body: 'The system extracts your target keyword automatically by finding overlapping words between your page title and H1 heading.\n\nExample: If your title is "Best Coffee Beans for Espresso" and H1 is "The Best Coffee Beans Guide", the extracted keyword is "best coffee beans".\n\nFor best results, make sure your title and H1 share a clear keyword focus.',
        },
        {
          heading: 'Keyword Optimization checks',
          body: '- Keyword in title: Should appear near the beginning\n- Keyword in meta description: Helps click-through rate\n- Keyword in H1: Confirms page topic to search engines\n- Keyword density (0.5-3%): Natural usage without stuffing\n- Keyword in first 100 words: Shows relevance early\n- Keyword in URL slug: Reinforces topic in the URL\n- Related keywords in subheadings: Shows depth of coverage\n- Keyword in image alt text: Additional relevance signal',
        },
        {
          heading: 'Readability scoring',
          body: 'Readability is measured using the Flesch-Kincaid formula, which calculates how easy your content is to read.\n\nScores:\n- 60-100: Easy to read (8th grade level) — ideal for web\n- 40-59: Moderate difficulty — OK for specialized content\n- 0-39: Difficult — may lose general audience\n\nAdditional checks: sentence length, paragraph length, subheading frequency, walls of text, and intro paragraph presence.',
        },
        {
          heading: 'How to improve keyword placement',
          body: '1. Rewrite your title tag to include the keyword near the front\n2. Update your H1 to clearly state the keyword\n3. Mention the keyword in your opening paragraph\n4. Use keyword variations in H2/H3 subheadings\n5. Add the keyword to your URL slug (set up 301 redirect if changing live URLs)\n6. Include the keyword naturally in 1-2 image alt texts\n\nAvoid keyword stuffing — Google penalizes unnatural repetition.',
        },
      ],
    },
  },

  technical: {
    text: 'Technical SEO',
    doc: {
      title: 'Technical SEO — Server, URL & Social Checks',
      sections: [
        {
          heading: 'Server & Performance data',
          body: 'When you run an SEO audit, we make a timed request to your server and capture:\n\n- Response time (TTFB): How fast your server responds. Under 500ms is good.\n- HTTP status: Should be 200 OK. Redirects add latency.\n- Compression: gzip/brotli reduces transfer size by 60-80%.\n- Cache headers: Proper caching speeds up return visits dramatically.\n- HSTS: Forces browsers to always use HTTPS.\n- Security headers: X-Frame-Options protects against clickjacking.\n\nSome headers may be hidden by CORS policies.',
        },
        {
          heading: 'Core Web Vitals',
          body: 'Core Web Vitals are Google\'s page experience metrics. We use the free PageSpeed Insights API.\n\n- LCP (Largest Contentful Paint): Under 2.5s — how fast the biggest element loads\n- TBT (Total Blocking Time): Under 200ms — how long the page is unresponsive\n- CLS (Cumulative Layout Shift): Under 0.1 — how much the layout jumps around\n- FCP (First Contentful Paint): Under 1.8s — time to first visible content\n- SI (Speed Index): Under 3.4s — how quickly content fills the viewport\n\nNote: The free API has rate limits. If you get a 429 error, wait 1-2 minutes or test directly at pagespeed.web.dev.',
        },
        {
          heading: 'URL structure best practices',
          body: '- Use HTTPS (confirmed ranking signal)\n- Keep URLs under 75 characters\n- Use hyphens between words, not underscores\n- Avoid URL parameters when possible\n- Include your target keyword in the URL slug\n- Use lowercase letters only\n\nChanging existing URLs requires 301 redirects from old to new.',
        },
        {
          heading: 'Social meta tags explained',
          body: 'Social meta tags control how your page looks when shared on social media.\n\nOpen Graph (Facebook, LinkedIn):\n- og:title — Social-optimized title (can differ from SEO title)\n- og:description — Compelling summary for social feeds\n- og:image — Preview image (recommended: 1200x630px)\n- og:type — Content type ("website" or "article")\n\nTwitter Card:\n- twitter:card — "summary_large_image" for large preview\n- twitter:image — Twitter-specific image (1200x600px)\n\nTest your tags:\n- Facebook: developers.facebook.com/tools/debug\n- Twitter: cards-dev.twitter.com/validator\n- LinkedIn: linkedin.com/post-inspector',
        },
      ],
    },
  },

  keywords: {
    text: 'Keyword Research',
    doc: {
      title: 'AI Keyword Research — How It Works',
      sections: [
        {
          heading: 'What does AI Keyword Research do?',
          body: 'The AI analyzes your scanned page content and generates:\n\n- Primary keyword recommendation\n- 15-20 related keywords with intent, difficulty, and type\n- Keyword clusters grouped by topic\n- Question-based keywords (great for featured snippets)\n- Strategic suggestions for your keyword targeting\n\nThis requires an API key configured in Settings.',
        },
        {
          heading: 'Search intent types',
          body: '- Informational: User wants to learn ("how to brew coffee")\n- Transactional: User wants to buy ("buy coffee beans online")\n- Navigational: User wants a specific site ("Starbucks menu")\n- Commercial: User is comparing options ("best coffee beans 2024")\n\nTarget a mix of intents. Informational keywords build authority; transactional keywords drive conversions.',
        },
        {
          heading: 'Keyword clusters',
          body: 'Keywords are grouped into topical clusters — related terms that should be covered across your site.\n\nExample cluster for "coffee beans":\n- coffee beans, arabica vs robusta, single origin coffee, coffee roasting levels\n\nCreate content that covers each cluster comprehensively. This builds topical authority, which Google rewards with higher rankings.',
        },
        {
          heading: 'How to use these keywords',
          body: '1. Pick 1 primary keyword per page — don\'t target too many on one page\n2. Use related keywords in subheadings and body text naturally\n3. Create separate pages for distinct keyword clusters\n4. Answer the question-based keywords in FAQ sections or dedicated articles\n5. Re-run keyword research after major content changes to find new opportunities',
        },
      ],
    },
  },

  content: {
    text: 'Content Optimization',
    doc: {
      title: 'AI Content Optimization — Suggestions & Strategy',
      sections: [
        {
          heading: 'What does Content Optimization analyze?',
          body: 'The AI reviews your page and suggests improvements for:\n\n- Title tag rewrites (SEO-optimized alternatives)\n- Meta description rewrites (click-through rate improvement)\n- Heading structure improvements\n- Content gaps — topics your page should cover\n- Internal linking opportunities\n- Readability improvements\n\nEach suggestion includes the current version, a suggested replacement, and the reasoning behind the change.',
        },
        {
          heading: 'Title & meta description tips',
          body: 'Title tag:\n- Include target keyword near the beginning\n- Keep under 60 characters (Google truncates longer titles)\n- Make it compelling — it\'s your "headline" in search results\n- Add a unique value proposition or number\n\nMeta description:\n- 150-160 characters maximum\n- Include the target keyword (Google bolds matching terms)\n- Add a call-to-action ("Learn how...", "Discover...")\n- Summarize the page\'s value clearly',
        },
        {
          heading: 'Content gaps',
          body: 'Content gaps are topics related to your keyword that your page doesn\'t cover.\n\nFilling content gaps:\n- Adds depth that Google values for ranking\n- Answers more user questions (reducing bounce rate)\n- Creates internal linking opportunities\n- Helps you compete with pages that cover these topics\n\nPriority levels:\n- High: Essential topics your competitors cover\n- Medium: Helpful additions for comprehensiveness\n- Low: Nice-to-have topics for completeness',
        },
        {
          heading: 'How to apply suggestions',
          body: '1. Click the copy button next to any suggestion to copy it to your clipboard\n2. Open your page\'s CMS or HTML editor\n3. Replace the current title/description/heading with the optimized version\n4. For content gaps, create new sections addressing the suggested topics\n5. Re-run the audit after making changes to see your improved score\n\nDon\'t apply all suggestions blindly — use your judgment about your brand voice and audience.',
        },
      ],
    },
  },
}
