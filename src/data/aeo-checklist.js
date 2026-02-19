export const phases = [
  {
    id: 'phase-1',
    number: 1,
    title: 'Foundation & Audit',
    color: '#FF6B35',
    icon: '\u{1F3D7}\uFE0F',
    timeline: 'Week 1-2',
    description: 'Establish your AEO baseline by auditing existing content and technical infrastructure.',
    categories: [
      {
        id: 'p1-content-audit',
        name: 'Content Audit',
        items: [
          {
            id: 'p1-c1-i1',
            text: 'Audit all pages for question-based intent coverage',
            detail: 'Review every page to identify which user questions it answers and find gaps in coverage.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Auditing Pages for Question-Based Intent',
              sections: [
                { heading: 'Why This Matters', body: 'AI search engines match user questions to content that directly answers them. Pages that don\'t align with question-based intent are invisible to answer engines. This audit reveals which questions your content addresses and which it misses.' },
                { heading: 'How to Perform the Audit', body: 'Create a spreadsheet with columns: Page URL, Page Title, Primary Questions Answered, Secondary Questions, Question Gaps. Go through each page and identify what questions a user might ask that this page answers. Use tools like AlsoAsked, AnswerThePublic, or Google\'s People Also Ask to find real questions in your niche.' },
                { heading: 'What to Look For', body: 'Check if pages have clear question-and-answer formatting. Look for pages that ramble without answering specific questions. Identify topics where you have no content. Pay attention to pages that rank well in traditional search — these are your best AEO candidates since they already have authority.' },
                { heading: 'Action Items', body: '1. Export your sitemap or page list\n2. For each page, list 3-5 questions it answers\n3. Cross-reference with keyword research for question queries\n4. Identify gaps where no page answers common questions\n5. Prioritize gaps by search volume and business relevance' }
              ]
            }
          },
          {
            id: 'p1-c1-i2',
            text: 'Identify pages already in AI overviews / featured snippets',
            detail: 'Find which of your pages are already being cited by AI engines or appearing in featured snippets.',
            action: { view: 'gsc', label: 'Open Search Console' },
            doc: {
              title: 'Identifying Existing AI Overview Appearances',
              sections: [
                { heading: 'Why This Matters', body: 'Pages already appearing in AI Overviews or featured snippets have proven authority and format that AI engines trust. These are your highest-value AEO assets — they show what is already working so you can replicate success patterns.' },
                { heading: 'How to Find Them', body: 'Use Google Search Console filtered by "Search Appearance > Featured Snippet." Tools like Ahrefs or SEMrush can identify snippet positions. Manually search your top 50 keywords in incognito and note which trigger AI Overviews. Check Perplexity.ai and ChatGPT for your key topics.' },
                { heading: 'Analyzing What Works', body: 'For each page appearing in AI results, document: the exact query, the format of cited content (paragraph, list, table), word count of the cited section, and schema markup present. Look for patterns — concise, direct answers in specific formats dominate.' },
                { heading: 'Action Items', body: '1. Run a featured snippet audit in your SEO tool\n2. Search top 50 queries in Google AI Overview mode\n3. Test 20 core queries in Perplexity.ai and ChatGPT\n4. Create a "wins" spreadsheet documenting every AI appearance\n5. Analyze content format patterns across winning pages' }
              ]
            }
          },
          {
            id: 'p1-c1-i3',
            text: 'Analyze competitor content AI engines cite',
            detail: 'Research which competitor pages are being cited by AI platforms to understand what formats succeed.',
            action: { view: 'competitors', label: 'Open Competitors' },
            doc: {
              title: 'Competitive Analysis for AI Engine Citations',
              sections: [
                { heading: 'Why This Matters', body: 'Understanding which competitor content gets cited by AI engines reveals the formats, depth, and authority signals that answer engines prefer. Competitors appearing in AI results have cracked the code for your niche — study them.' },
                { heading: 'How to Conduct the Analysis', body: 'Identify your top 5-10 competitors. Search 30-50 relevant queries in Perplexity.ai (shows sources explicitly), ChatGPT with browsing, and Google AI Overviews. Record which domains appear most, which pages get cited, and the exact content pulled.' },
                { heading: 'What to Analyze', body: 'For each cited competitor page examine: content structure (headings, lists, tables), word count, schema markup, freshness, author credentials, sources cited, and domain authority. Pay close attention to the specific paragraphs AI engines quote — these reveal the ideal answer format.' },
                { heading: 'Action Items', body: '1. List top 20 queries where competitors are cited but you are not\n2. Document the format and depth of winning content\n3. Create briefs for content that exceeds competitor quality\n4. Focus on adding unique value: original data, expert quotes, better visuals\n5. Track changes in AI citations monthly after publishing' }
              ]
            }
          },
          {
            id: 'p1-c1-i4',
            text: 'Map user journey questions at each funnel stage',
            detail: 'Identify questions users ask at awareness, consideration, and decision stages.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Mapping Questions Across the User Journey',
              sections: [
                { heading: 'Why This Matters', body: 'Users ask fundamentally different questions at each journey stage — from "what is X?" at awareness to "X vs Y pricing" at decision. AI engines serve answers for all of these. If your content only covers one funnel stage, you\'re invisible for the others.' },
                { heading: 'Funnel Stage Question Patterns', body: 'Awareness: "What is," "Why does," "How does X work" — educational, broad. Consideration: "Best X for," "X vs Y," "How to choose" — comparison, evaluation. Decision: "X pricing," "X free trial," "How to set up X" — action-oriented. Post-Purchase: "How to use X for," "X troubleshooting" — support questions.' },
                { heading: 'How to Map Questions', body: 'For each product/service/topic, brainstorm 10-20 questions per funnel stage. Validate with Google Keyword Planner, AlsoAsked, AnswerThePublic. Interview sales and support teams — they hear real customer questions daily.' },
                { heading: 'Action Items', body: '1. Define 3-5 core topic areas\n2. List 10-20 questions per funnel stage per topic\n3. Validate question demand with search data\n4. Map existing content to each question\n5. Identify and prioritize coverage gaps\n6. Create a content calendar to fill highest-impact gaps' }
              ]
            }
          },
          {
            id: 'p1-c1-i5',
            text: 'Audit existing FAQ pages and knowledge base',
            detail: 'Evaluate current FAQ and help content for completeness, format, and AEO readiness.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Auditing FAQ Pages and Knowledge Base',
              sections: [
                { heading: 'Why This Matters', body: 'FAQ pages are your most natural AEO assets — they already use Q&A format. However, most are poorly structured, outdated, or too thin. A thorough audit transforms these underperforming assets into your strongest AEO content.' },
                { heading: 'What to Evaluate', body: 'For each FAQ page assess: Are questions phrased the way real users ask? Are answers direct and concise (40-60 words for core answers)? Is FAQPage schema implemented? Are answers current? Do answers link to detailed content? Is the page discoverable via internal linking?' },
                { heading: 'Common Problems', body: 'Questions written from company perspective instead of user perspective. Answers too vague or too long. No schema markup. FAQ pages buried with no internal links. Outdated information. Single monolithic FAQ instead of topic-specific sections.' },
                { heading: 'Action Items', body: '1. Inventory every FAQ page and knowledge base article\n2. Score each on question quality, answer quality, schema, freshness, linking\n3. Rewrite questions to match natural user phrasing\n4. Add FAQPage schema to every FAQ section\n5. Create a quarterly review schedule for freshness' }
              ]
            }
          },
          {
            id: 'p1-c1-i6',
            text: 'Evaluate AI portrayal accuracy for your brand',
            detail: 'Check how AI platforms describe your brand and identify any inaccuracies or gaps in their knowledge.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Evaluating AI Portrayal Accuracy',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines build brand narratives from scattered web data. If the information they surface about your company is outdated, incomplete, or wrong, every user who asks about you gets a distorted picture. Proactive monitoring lets you identify and fix these issues before they compound.' },
                { heading: 'How to Evaluate', body: 'Search your brand name in ChatGPT, Perplexity, Google AI Overviews, and Claude. Ask questions like "What does [brand] do?", "Is [brand] good for [use case]?", "What are alternatives to [brand]?" Document every factual error, outdated claim, or missing information.' },
                { heading: 'Common Issues', body: 'Outdated product descriptions or pricing. Missing recent product launches. Inaccurate founding dates or leadership info. Confusing your brand with a similarly named company. Omitting key differentiators. Citing competitor comparisons that are no longer accurate.' },
                { heading: 'Action Items', body: '1. Run branded queries across all major AI platforms\n2. Document every inaccuracy in a spreadsheet\n3. Trace each error to its likely source (outdated page, wrong directory listing)\n4. Fix source content and update structured data\n5. Re-test monthly to verify corrections propagate' }
              ]
            }
          },
          {
            id: 'p1-c1-i7',
            text: 'Prioritize AEO topics by impact and feasibility',
            detail: 'Rank topic opportunities by search volume, competition level, existing authority, and business value to focus efforts.',
            action: { view: 'content-ops', label: 'Open Content Ops' },
            doc: {
              title: 'Prioritizing AEO Topics',
              sections: [
                { heading: 'Why This Matters', body: 'You cannot optimize everything at once. A prioritization framework ensures you focus on topics where you can realistically win AI citations AND where those citations drive meaningful business outcomes. Without prioritization, effort is scattered and results are slow.' },
                { heading: 'Prioritization Framework', body: 'Score each topic 1-5 on four dimensions: Search Volume (how often is this asked?), Competition (how many authoritative sources already answer this?), Authority (do you have genuine expertise here?), Business Impact (does winning this citation drive revenue?). Multiply scores for a composite priority rank.' },
                { heading: 'Implementation', body: 'Start with topics scoring 60+ (out of 625 max). These are your quick wins — high demand, low competition, strong authority, clear business value. Move to medium-priority topics once quick wins are secured. Revisit scoring quarterly as your authority grows.' },
                { heading: 'Action Items', body: '1. List 50-100 candidate topics from your audit\n2. Score each on the 4 dimensions\n3. Sort by composite score\n4. Assign top 10 to immediate content sprints\n5. Create a backlog for medium-priority topics\n6. Review and re-score quarterly' }
              ]
            }
          }
        ]
      },
      {
        id: 'p1-technical-baseline',
        name: 'Technical Baseline',
        items: [
          {
            id: 'p1-c2-i1',
            text: 'Verify robots.txt allows AI crawler access (GPTBot, Google-Extended, ClaudeBot, PerplexityBot, CCBot, Bytespider)',
            detail: 'Ensure robots.txt does not block major AI crawlers from accessing your content.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Configuring robots.txt for AI Crawlers',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines can only cite content their crawlers can access. Many sites block AI bots through restrictive robots.txt rules. If you want to appear in AI answers, you must allow these crawlers. Blocking them makes you invisible to AI search.' },
                { heading: 'Key AI Crawlers', body: 'GPTBot — OpenAI/ChatGPT. Google-Extended — Google AI/Gemini. ClaudeBot — Anthropic/Claude. PerplexityBot — Perplexity.ai. CCBot — Common Crawl (used by many AI systems). Bytespider — ByteDance. Each has a specific user-agent string recognized by robots.txt.' },
                { heading: 'How to Configure', body: 'Visit yourdomain.com/robots.txt. Search for "Disallow" directives targeting these bots. Remove blocks or add explicit Allow directives. Example:\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /' },
                { heading: 'Testing', body: 'Use Google\'s robots.txt testing tool. Test with curl: curl -A "GPTBot" https://yoursite.com/ and verify 200 response. Check server logs for AI bot visits after allowing them.' },
                { heading: 'Action Items', body: '1. Review your robots.txt file\n2. Remove any blocks on AI crawler user-agents\n3. Add explicit Allow directives\n4. Test with curl for each bot user-agent\n5. Monitor server logs for crawler visits\n6. Review robots.txt quarterly' }
              ]
            }
          },
          {
            id: 'p1-c2-i2',
            text: 'Ensure sitemap.xml is complete, valid, submitted to Google AND Bing',
            detail: 'Verify sitemap includes all important pages and is submitted to both search consoles.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Sitemap Completeness and Submission',
              sections: [
                { heading: 'Why This Matters', body: 'Your sitemap is the roadmap AI crawlers use to discover content. Submitting to Bing is critical for AEO because ChatGPT and Copilot rely on Bing\'s index. Many sites neglect Bing, making content invisible to major AI platforms.' },
                { heading: 'Completeness Checklist', body: 'Include: all blog posts, product pages, category pages, FAQ pages, key informational pages. Exclude: admin pages, duplicate content, noindex pages. Ensure lastmod dates are accurate and update when content changes.' },
                { heading: 'Submission', body: 'Google: Submit via Google Search Console > Sitemaps. Bing: Submit via Bing Webmaster Tools > Sitemaps. Implement IndexNow protocol for instant Bing URL submission of new/updated content.' },
                { heading: 'Action Items', body: '1. Audit sitemap for completeness\n2. Validate XML syntax\n3. Check all URLs return 200 status\n4. Submit to Google Search Console\n5. Submit to Bing Webmaster Tools\n6. Implement IndexNow for real-time indexing' }
              ]
            }
          },
          {
            id: 'p1-c2-i3',
            text: 'Check Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1)',
            detail: 'Measure and optimize Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Core Web Vitals for AEO',
              sections: [
                { heading: 'Why This Matters', body: 'Core Web Vitals are ranking factors that influence which pages appear in AI Overviews. Slow pages are less likely to be selected as AI answer sources. Thresholds: LCP < 2.5s, INP < 200ms, CLS < 0.1.' },
                { heading: 'How to Measure', body: 'Use PageSpeed Insights (pagespeed.web.dev) for lab and field data. Check Google Search Console Core Web Vitals report. Run Lighthouse in Chrome DevTools. Use WebPageTest.org for waterfall analysis.' },
                { heading: 'Common Fixes', body: 'LCP: Optimize images (WebP/AVIF), preload LCP image, reduce TTFB, remove render-blocking resources, use CDN. INP: Break long JS tasks, defer non-critical JS, optimize event handlers. CLS: Set image/video dimensions, reserve ad space, avoid inserting content above existing content.' },
                { heading: 'Action Items', body: '1. Run PageSpeed Insights on top 10 pages\n2. Fix pages failing any CWV threshold\n3. Prioritize by traffic and importance\n4. Re-test after fixes\n5. Set up real-user monitoring' }
              ]
            }
          },
          {
            id: 'p1-c2-i4',
            text: 'Verify SSL/HTTPS entire site',
            detail: 'Confirm every page loads over HTTPS with valid SSL and no mixed content.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Full-Site HTTPS Verification',
              sections: [
                { heading: 'Why This Matters', body: 'HTTPS is a baseline trust signal. Pages served over HTTP are deprioritized by search engines. AI engines prefer citing secure sources. Mixed content undermines trust.' },
                { heading: 'How to Verify', body: 'Check SSL certificate validity at ssllabs.com/ssltest. Crawl entire site for HTTP URLs in pages, images, scripts. Verify HTTP-to-HTTPS redirects are in place. Check canonical tags point to HTTPS.' },
                { heading: 'Common Fixes', body: 'Update mixed content URLs to HTTPS. Fix expired certificates. Implement 301 redirects from HTTP to HTTPS. Enable HSTS header. Ensure CDN has SSL configured.' },
                { heading: 'Action Items', body: '1. Run SSL test at ssllabs.com\n2. Crawl for mixed content\n3. Fix all HTTP references\n4. Enable HSTS\n5. Set up auto-renewal for SSL certificate' }
              ]
            }
          },
          {
            id: 'p1-c2-i5',
            text: 'Test mobile responsiveness and accessibility (Lighthouse)',
            detail: 'Run Lighthouse audits for mobile performance and accessibility compliance.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Mobile and Accessibility Auditing',
              sections: [
                { heading: 'Why This Matters', body: 'Google uses mobile-first indexing — your mobile version is primary for ranking and AI Overview selection. Accessibility practices make content more parseable by AI crawlers too.' },
                { heading: 'Running Lighthouse', body: 'Open Chrome DevTools > Lighthouse tab > select Mobile. Check Performance, Accessibility, Best Practices, SEO. Aim for 90+ on all categories. Run on your top 10 page templates.' },
                { heading: 'Key Checks', body: 'Text readable without zooming (16px+ body font). Tap targets 48x48px minimum. No horizontal scrolling. Images scale properly. All images have alt text. Proper heading hierarchy. Sufficient color contrast (4.5:1).' },
                { heading: 'Action Items', body: '1. Run Lighthouse mobile audits on top 10 templates\n2. Fix accessibility issues below 90 score\n3. Test on 3+ real mobile devices\n4. Add missing alt text\n5. Fix heading hierarchy\n6. Schedule quarterly audits' }
              ]
            }
          },
          {
            id: 'p1-c2-i6',
            text: 'Analyze server logs for AI crawler activity (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot)',
            detail: 'Review server access logs to understand which AI crawlers visit your site, which pages they prioritize, and how frequently they crawl.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'AI Crawler Log Analysis',
              sections: [
                { heading: 'Why This Matters', body: 'AI crawlers visit your site with vastly different frequencies and purposes. GPTBot has a crawl-to-refer ratio of approximately 1,700:1, meaning it crawls 1,700 pages for every one it references. ClaudeBot\'s ratio is even higher at 73,000:1. Understanding which bots visit, what they crawl, and how often reveals what AI systems find valuable about your content and where technical barriers exist.' },
                { heading: 'Key AI Crawler User-Agents', body: 'GPTBot — OpenAI training crawler. OAI-SearchBot — OpenAI search/citation crawler. ClaudeBot — Anthropic\'s crawler. PerplexityBot — Perplexity.ai\'s crawler. Google-Extended — Google AI training crawler. Bytespider — ByteDance\'s crawler. CCBot — Common Crawl. Each appears in server logs with a distinct user-agent string you can filter for.' },
                { heading: 'How to Analyze', body: 'Access your server logs (Apache: access.log, Nginx: access.log, or use a log analysis tool). Filter for AI bot user-agent strings. Track: which bots visit, crawl frequency per bot, which pages are crawled most, response codes returned, and crawl patterns over time. Compare crawled pages against your most-cited content to identify gaps.' },
                { heading: 'Action Items', body: '1. Access your server logs or log analytics tool\n2. Filter for AI bot user-agent strings\n3. Document which bots visit and their crawl frequency\n4. Identify your most-crawled pages\n5. Compare crawl patterns to your AI citation data\n6. Investigate pages that are crawled but not cited (content issue) and pages not crawled at all (technical issue)\n7. Set up recurring log analysis on a monthly basis' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'phase-2',
    number: 2,
    title: 'Structured Data & Schema',
    color: '#7B2FBE',
    icon: '\u{1F4CA}',
    timeline: 'Week 2-4',
    description: 'Implement comprehensive schema markup to make your content machine-readable for AI engines.',
    categories: [
      {
        id: 'p2-core-schema',
        name: 'Core Schema',
        items: [
          {
            id: 'p2-c1-i1',
            text: 'FAQPage schema on all FAQ content (JSON-LD)',
            detail: 'Add FAQPage structured data to every page with FAQ content using JSON-LD format.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Implementing FAQPage Schema',
              sections: [
                { heading: 'Why This Matters', body: 'FAQPage schema is the most impactful schema type for AEO. It tells AI engines exactly which questions your page answers and provides the answers in a structured format. Pages with FAQPage schema are significantly more likely to be cited in AI-generated answers.' },
                { heading: 'JSON-LD Implementation', body: 'Add a <script type="application/ld+json"> block in your page\'s <head> or <body>. Structure:\n{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [{\n    "@type": "Question",\n    "name": "Your question here?",\n    "acceptedAnswer": {\n      "@type": "Answer",\n      "text": "Your answer here."\n    }\n  }]\n}' },
                { heading: 'Best Practices', body: 'Include 5-10 questions per FAQPage. Questions should match natural user queries. Answers should be concise but complete (40-60 words ideal). Include the schema on every page with FAQ content, not just dedicated FAQ pages.' },
                { heading: 'Action Items', body: '1. Identify all pages with FAQ content\n2. Write JSON-LD FAQPage schema for each\n3. Test with Google Rich Results Test\n4. Deploy to production\n5. Monitor for rich result appearances in GSC' }
              ]
            }
          },
          {
            id: 'p2-c1-i2',
            text: 'HowTo schema for tutorials/processes',
            detail: 'Add HowTo structured data to tutorial and process content.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Implementing HowTo Schema',
              sections: [
                { heading: 'Why This Matters', body: 'HowTo schema marks up step-by-step content in a way AI engines can parse and present directly. This is valuable for procedural queries ("how to..." questions) which are among the most common AI search queries.' },
                { heading: 'Implementation', body: 'Use JSON-LD with @type: HowTo. Include: name, description, step array (each with @type: HowToStep, name, text, optional image), totalTime, estimatedCost if applicable. Each step should be clear and actionable.' },
                { heading: 'Best Practices', body: 'Keep step descriptions concise. Include images per step where helpful. Add time and cost estimates. Ensure the steps in schema match the visible content exactly — mismatches can cause validation failures and trust penalties.' },
                { heading: 'Action Items', body: '1. Identify all tutorial/process content\n2. Implement HowTo schema with complete step data\n3. Validate with Rich Results Test\n4. Ensure schema matches visible content exactly' }
              ]
            }
          },
          {
            id: 'p2-c1-i3',
            text: 'Article/BlogPosting schema with full metadata',
            detail: 'Add Article or BlogPosting schema with author, dates, publisher, and images.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Article and BlogPosting Schema',
              sections: [
                { heading: 'Why This Matters', body: 'Article schema provides AI engines with rich metadata about your content: who wrote it, when, for which organization, and what it\'s about. This directly supports E-E-A-T signals that AI engines use to evaluate source trustworthiness.' },
                { heading: 'Required Properties', body: 'headline, author (with @type: Person and name), datePublished, dateModified, publisher (with @type: Organization, name, logo), image, description. Use BlogPosting for blog content, NewsArticle for news, Article as a general fallback.' },
                { heading: 'E-E-A-T Enhancement', body: 'Link the author property to a Person entity with credentials (jobTitle, sameAs links to social profiles, affiliation). This builds the author\'s entity in the knowledge graph and strengthens AI trust in the content.' },
                { heading: 'Action Items', body: '1. Implement Article/BlogPosting schema on all editorial content\n2. Include complete author information with Person schema\n3. Ensure dateModified updates when content changes\n4. Validate with Rich Results Test\n5. Add publisher Organization schema' }
              ]
            }
          },
          {
            id: 'p2-c1-i4',
            text: 'Product schema with complete offers',
            detail: 'Add Product schema with price, availability, currency, reviews, and brand.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Product Schema Implementation',
              sections: [
                { heading: 'Why This Matters', body: 'Product schema helps AI engines understand and present your product information in shopping and comparison queries. Complete product data increases the chance of being cited when users ask AI assistants about product recommendations.' },
                { heading: 'Required Properties', body: 'name, description, image, offers (with price, priceCurrency, availability, url), brand, sku. Optional but valuable: aggregateRating, review, gtin/mpn for product identification.' },
                { heading: 'Best Practices', body: 'Keep prices updated in real-time. Use standard availability values (InStock, OutOfStock, PreOrder). Include multiple images. Add aggregate ratings when available. Ensure the schema price matches the visible price exactly.' },
                { heading: 'Action Items', body: '1. Implement Product schema on all product pages\n2. Include complete Offer data (price, availability, currency)\n3. Add brand and identifier properties\n4. Include aggregateRating if reviews exist\n5. Validate and monitor for errors' }
              ]
            }
          },
          {
            id: 'p2-c1-i5',
            text: 'Organization schema (logo, sameAs, contact)',
            detail: 'Add Organization schema with complete business information and social links.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Organization Schema',
              sections: [
                { heading: 'Why This Matters', body: 'Organization schema establishes your brand entity in the knowledge graph. AI engines use this to understand who you are, verify legitimacy, and connect your content to your brand across the web. It\'s foundational for brand authority in AI search.' },
                { heading: 'Key Properties', body: 'name, url, logo (ImageObject), sameAs (array of social profile URLs), contactPoint (with telephone, email, contactType), address, description, foundingDate. The sameAs property is critical — it connects your entity across platforms.' },
                { heading: 'Implementation', body: 'Place Organization schema on your homepage or in a site-wide script. Include all official social media URLs in sameAs. Use a high-quality logo image. Include multiple contact points if applicable.' },
                { heading: 'Action Items', body: '1. Create Organization schema with complete business data\n2. Include all social media URLs in sameAs\n3. Add contactPoint information\n4. Place on homepage\n5. Validate with Schema.org validator' }
              ]
            }
          },
          {
            id: 'p2-c1-i6',
            text: 'BreadcrumbList schema on every page',
            detail: 'Implement BreadcrumbList schema to show page hierarchy to search engines.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'BreadcrumbList Schema',
              sections: [
                { heading: 'Why This Matters', body: 'BreadcrumbList schema helps AI engines understand your site hierarchy and the context of each page within your site structure. This improves content categorization and helps AI engines determine topical relevance.' },
                { heading: 'Implementation', body: 'Add JSON-LD with @type: BreadcrumbList and an itemListElement array. Each element needs @type: ListItem, position (starting at 1), name, and item (URL). The last item in the list is the current page.' },
                { heading: 'Best Practices', body: 'Match the visible breadcrumb navigation exactly. Include on every page except the homepage. Keep names concise but descriptive. Ensure all URLs in the breadcrumb are valid and crawlable.' },
                { heading: 'Action Items', body: '1. Implement BreadcrumbList schema on all pages\n2. Match visible breadcrumb navigation\n3. Validate schema on sample pages\n4. Automate via CMS template' }
              ]
            }
          },
          {
            id: 'p2-c1-i7',
            text: 'Design CMS content models for structured schema output',
            detail: 'Structure your CMS collections and content types so they naturally produce clean schema markup without manual intervention.',
            action: { view: 'docs', label: 'Open Documentation' },
            doc: {
              title: 'CMS Content Models for Schema',
              sections: [
                { heading: 'Why This Matters', body: 'If your CMS is structured correctly, schema markup generates automatically from your content fields. This eliminates manual markup errors, ensures consistency across hundreds of pages, and makes schema maintenance effortless as you publish new content.' },
                { heading: 'Architecture Principles', body: 'Map each CMS collection to a schema type (Blog → Article, Products → Product, Team → Person, FAQ → FAQPage). Create dedicated fields for schema-required properties: author, datePublished, dateModified, description, image. Use reference fields to link related collections (author → articles).' },
                { heading: 'Implementation', body: 'In Webflow or your CMS: create a "Schema Type" field on each collection. Build components that read CMS fields and output JSON-LD automatically. For FAQ sections, use a multi-reference or rich text field that parses into question/answer pairs. Test with Google Rich Results Test after each template change.' },
                { heading: 'Action Items', body: '1. Audit every CMS collection and its fields\n2. Map collections to schema types\n3. Add missing fields required by each schema type\n4. Build template-level JSON-LD generation from CMS fields\n5. Validate output on 5 sample pages per collection\n6. Document the mapping for your team' }
              ]
            }
          }
        ]
      },
      {
        id: 'p2-advanced-schema',
        name: 'Advanced Schema',
        items: [
          {
            id: 'p2-c2-i1',
            text: 'Speakable schema for voice search',
            detail: 'Mark up content sections that are especially suited for voice/audio playback.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Speakable Schema for Voice Search',
              sections: [
                { heading: 'Why This Matters', body: 'Speakable schema identifies sections of content that are best suited for audio playback via voice assistants and text-to-speech. As AI assistants increasingly use voice interfaces, speakable markup helps your content get selected for spoken answers.' },
                { heading: 'Implementation', body: 'Use the speakable property within Article or WebPage schema. Specify cssSelector or xpath values pointing to the content blocks best suited for reading aloud. Target concise, self-contained paragraphs that directly answer questions.' },
                { heading: 'Best Practices', body: 'Mark up your best 40-60 word answer paragraphs. Avoid marking navigation, ads, or boilerplate. Content should make sense when read aloud without visual context. Keep speakable sections under 2-3 paragraphs.' },
                { heading: 'Action Items', body: '1. Identify your best answer paragraphs on key pages\n2. Add speakable property to Article/WebPage schema\n3. Use CSS selectors to target specific content blocks\n4. Test by reading the marked content aloud' }
              ]
            }
          },
          {
            id: 'p2-c2-i2',
            text: 'Review/AggregateRating schema',
            detail: 'Add review and rating schema to content with user or expert reviews.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Review and Rating Schema',
              sections: [
                { heading: 'Why This Matters', body: 'Review and AggregateRating schema provides social proof data that AI engines can include in recommendations. When AI assistants answer "best X" queries, they heavily weight content with structured rating data.' },
                { heading: 'Implementation', body: 'Use @type: AggregateRating with ratingValue, bestRating, ratingCount, reviewCount. For individual reviews use @type: Review with author, datePublished, reviewBody, reviewRating. Nest within Product, LocalBusiness, or other relevant types.' },
                { heading: 'Guidelines', body: 'Only add review schema for genuine user/expert reviews. Self-serving reviews violate Google\'s guidelines. Ensure ratingValue and counts match visible data. Keep reviews fresh and representative.' },
                { heading: 'Action Items', body: '1. Identify pages with genuine reviews/ratings\n2. Implement AggregateRating schema\n3. Add individual Review schema where applicable\n4. Ensure data matches visible reviews exactly\n5. Validate with Rich Results Test' }
              ]
            }
          },
          {
            id: 'p2-c2-i3',
            text: 'LocalBusiness schema if applicable',
            detail: 'Add LocalBusiness schema for businesses with physical locations.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'LocalBusiness Schema',
              sections: [
                { heading: 'Why This Matters', body: 'LocalBusiness schema is essential for any business with a physical presence. AI engines use this for location-based queries, "near me" searches, and local recommendations. It connects your business to map and directory data.' },
                { heading: 'Key Properties', body: 'name, address (PostalAddress), telephone, openingHoursSpecification, geo (latitude/longitude), priceRange, image, sameAs, areaServed. Use a specific subtype like Restaurant, MedicalBusiness, etc. when applicable.' },
                { heading: 'Multi-Location', body: 'For businesses with multiple locations, create separate LocalBusiness schema for each location on its dedicated page. Include unique addresses, phone numbers, and hours for each.' },
                { heading: 'Action Items', body: '1. Determine if LocalBusiness applies to your business\n2. Implement with complete address and contact info\n3. Add opening hours and geo coordinates\n4. Create per-location schema for multi-location businesses\n5. Validate and cross-reference with Google Business Profile' }
              ]
            }
          },
          {
            id: 'p2-c2-i4',
            text: 'VideoObject schema for videos',
            detail: 'Add VideoObject schema to all pages containing embedded videos.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'VideoObject Schema',
              sections: [
                { heading: 'Why This Matters', body: 'Video content is increasingly referenced by AI engines. VideoObject schema helps AI understand what your videos contain, when they were published, and how long they are. This enables video content to appear in AI-generated answers.' },
                { heading: 'Implementation', body: 'Use @type: VideoObject with name, description, thumbnailUrl, uploadDate, duration (ISO 8601 format), contentUrl or embedUrl. Add transcript text in the description for maximum AEO value.' },
                { heading: 'Best Practices', body: 'Include detailed descriptions that summarize video content. Add transcript text — this gives AI engines searchable text content from your video. Use descriptive thumbnails. Keep duration accurate.' },
                { heading: 'Action Items', body: '1. Inventory all pages with video content\n2. Implement VideoObject schema on each\n3. Add transcripts to video descriptions\n4. Validate with Rich Results Test\n5. Include videos in your video sitemap' }
              ]
            }
          },
          {
            id: 'p2-c2-i5',
            text: 'Validate ALL schema — zero errors everywhere',
            detail: 'Run validation on every schema implementation and fix all errors and warnings.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Schema Validation and Error Resolution',
              sections: [
                { heading: 'Why This Matters', body: 'Invalid schema is worse than no schema — it can confuse AI engines and search engine parsers. Errors may cause your rich results to be dropped entirely. Zero errors across all pages is the standard you should target.' },
                { heading: 'Validation Tools', body: 'Google Rich Results Test (search.google.com/test/rich-results) — tests Google-specific eligibility. Schema.org Validator (validator.schema.org) — validates against the full Schema.org specification. Run both on every page template.' },
                { heading: 'Common Errors', body: 'Missing required properties. Incorrect data types (string where number expected). Broken URLs in schema. Mismatched data between schema and visible content. Nesting errors. Using deprecated properties.' },
                { heading: 'Systematic Validation', body: 'Don\'t validate pages one by one — test each unique page template, then spot-check individual pages. Set up automated testing in your CI/CD pipeline. Monitor Google Search Console\'s Enhancement reports for schema errors.' },
                { heading: 'Action Items', body: '1. List all unique page templates with schema\n2. Validate each template in both tools\n3. Fix all errors and warnings\n4. Set up automated validation in build pipeline\n5. Monitor GSC Enhancements weekly' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'phase-3',
    number: 3,
    title: 'Content Optimization',
    color: '#0EA5E9',
    icon: '\u270D\uFE0F',
    timeline: 'Week 3-8',
    description: 'Restructure and optimize content to be the best possible answer for AI engines.',
    categories: [
      {
        id: 'p3-content-structure',
        name: 'Content Structure',
        items: [
          {
            id: 'p3-c1-i1',
            text: 'Inverted Pyramid format (answer first, details after)',
            detail: 'Structure content with the direct answer at the top, followed by supporting details.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Inverted Pyramid Content Structure',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines extract answers from the first relevant paragraph they find. If your answer is buried after an introduction, history lesson, or preamble, AI will skip your content for a competitor that leads with the answer. The inverted pyramid puts your answer first.' },
                { heading: 'How to Structure', body: 'Paragraph 1: Direct, complete answer to the query (40-60 words). Paragraph 2-3: Essential supporting context. Remaining content: Deep details, examples, edge cases. Think like a journalist writing a news story — the headline and first paragraph should give you everything you need.' },
                { heading: 'Examples', body: 'Bad: "In this article, we\'ll explore the fascinating history of..."\nGood: "A reverse proxy is a server that sits between client devices and backend servers, forwarding client requests to the appropriate server. It provides load balancing, SSL termination, and caching."' },
                { heading: 'Action Items', body: '1. Audit your top 20 pages for answer placement\n2. Move the core answer to the first paragraph\n3. Remove filler introductions\n4. Keep the answer paragraph to 40-60 words\n5. Follow with supporting details in descending importance' }
              ]
            }
          },
          {
            id: 'p3-c1-i2',
            text: 'Clear H2/H3 hierarchy matching question intent',
            detail: 'Use heading tags that directly match the questions users are asking.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Question-Intent Heading Hierarchy',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines use heading structure to understand content organization and find specific answers within a page. Headings that match user question patterns (H2: "What is X?" H3: "How does X work?") are direct signals to AI about what each section answers.' },
                { heading: 'How to Structure', body: 'H1: Page topic (one per page). H2s: Major question categories or primary questions. H3s: Sub-questions or specific aspects. Each heading should be answerable — if someone asked the heading as a question, the content below should answer it completely.' },
                { heading: 'Heading Format Tips', body: 'Use natural question phrasing: "How Much Does X Cost?" not "Pricing Information." Include the key entity/topic in each heading. Keep headings under 60 characters. Maintain logical hierarchy — never skip levels (H2 > H4).' },
                { heading: 'Action Items', body: '1. Audit heading hierarchy on key pages\n2. Rewrite headings to match question intent\n3. Ensure logical H1 > H2 > H3 hierarchy\n4. Verify no skipped heading levels\n5. Cross-reference headings with PAA questions' }
              ]
            }
          },
          {
            id: 'p3-c1-i3',
            text: '40-60 word answer paragraphs for key questions (THE key AEO technique)',
            detail: 'Write concise, self-contained answer paragraphs that AI engines can extract directly.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'The 40-60 Word Answer Paragraph',
              sections: [
                { heading: 'Why This Is THE Key Technique', body: 'This is the single most important AEO technique. AI engines overwhelmingly prefer extracting concise, self-contained paragraphs of 40-60 words. This length is long enough to be a complete answer but short enough to be quoted directly. Featured snippets and AI Overviews are built from these.' },
                { heading: 'How to Write One', body: 'Start with the entity or concept name. Use "is" or "are" to create a definition-style opening. Include the most essential details. End with a key differentiator or important nuance. The paragraph should make complete sense in isolation — as if it were the only text a reader would see.' },
                { heading: 'Examples', body: 'Example (52 words): "Answer Engine Optimization (AEO) is the practice of optimizing web content to be selected, cited, and presented by AI-powered search engines and virtual assistants. Unlike traditional SEO which focuses on ranking in search results, AEO focuses on being the direct answer that AI platforms provide to user questions."' },
                { heading: 'Where to Place Them', body: 'Immediately after every H2 question heading. At the top of FAQ answers. In the opening paragraph of every article. In definition boxes or callouts. Anywhere you answer a key question — lead with a 40-60 word answer paragraph.' },
                { heading: 'Action Items', body: '1. Identify top 20 questions your site should answer\n2. Write a 40-60 word answer paragraph for each\n3. Place directly after the corresponding heading\n4. Test readability in isolation\n5. Monitor which get picked up by AI engines' }
              ]
            }
          },
          {
            id: 'p3-c1-i4',
            text: 'TL;DR / Summary boxes on long content',
            detail: 'Add summary sections at the top of long-form content for quick answer extraction.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'TL;DR and Summary Boxes',
              sections: [
                { heading: 'Why This Matters', body: 'Long-form content provides depth but AI engines need quick, extractable answers. TL;DR boxes give AI a pre-formatted summary to cite while the full content provides authority signals. They\'re also great for user experience.' },
                { heading: 'Implementation', body: 'Place a visually distinct summary box near the top of long content (after a brief intro). Include 3-5 key takeaways or a 2-3 sentence summary. Use a <div> with a class like "summary" or "tldr" that\'s easily identifiable. Keep each point concise and self-contained.' },
                { heading: 'Best Practices', body: 'Make summaries genuinely useful — not teaser text. Include the answer to the page\'s primary question. Use bullet points for scannability. Consider adding it inside a <section> with an aria-label for accessibility.' },
                { heading: 'Action Items', body: '1. Identify all content over 1000 words\n2. Write a TL;DR summary for each\n3. Place at top of content in a styled box\n4. Include 3-5 key takeaways\n5. Test that summaries stand alone' }
              ]
            }
          },
          {
            id: 'p3-c1-i5',
            text: "Definition-style formatting ('[Term] is [definition]')",
            detail: 'Use clear definition formatting to help AI engines extract and present your definitions.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Definition-Style Content Formatting',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines are heavily trained on definition patterns. The format "[Term] is [definition]" is one of the most commonly extracted patterns for AI answers. Using this format consistently makes your content an easy target for citation.' },
                { heading: 'How to Format', body: 'Lead with the term being defined. Use "is," "are," "refers to," or "means" as the connecting verb. Follow with a clear, concise definition. Keep the core definition to one sentence, then expand.\n\nExample: "Schema markup is a standardized vocabulary of tags that you add to your HTML to help search engines understand the content and context of your web pages."' },
                { heading: 'Where to Use', body: 'Opening paragraphs of informational pages. Glossary entries. First mention of any technical term. FAQ answers. Product descriptions.' },
                { heading: 'Action Items', body: '1. Identify key terms in your niche\n2. Write definition-style opening paragraphs\n3. Use the [Term] is [definition] pattern consistently\n4. Create a glossary page with definitions\n5. Cross-link definitions to detailed content' }
              ]
            }
          },
          {
            id: 'p3-c1-i6',
            text: "Comparison tables for 'vs' and 'best of' queries",
            detail: 'Create structured comparison tables for competitive and list-based queries.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Comparison Tables for AEO',
              sections: [
                { heading: 'Why This Matters', body: '"X vs Y" and "best X for Y" are among the most common AI search queries. AI engines love structured comparison data they can present directly. Well-formatted HTML tables are highly likely to be extracted and cited in AI answers.' },
                { heading: 'Table Structure', body: 'Use semantic HTML <table> with <thead> and <tbody>. Include clear column headers. First column should be the feature/criteria being compared. Keep cell content concise. Add a summary row or recommendation at the bottom.' },
                { heading: 'Best Practices', body: 'Cover the criteria users actually care about (not just features you want to highlight). Be objective — biased comparisons lose trust. Include pricing. Use checkmarks/X marks for feature presence. Keep tables under 10 rows for readability.' },
                { heading: 'Action Items', body: '1. Identify "vs" and "best of" queries in your niche\n2. Create comparison tables with genuine, useful data\n3. Use semantic HTML table markup\n4. Add a summary/recommendation paragraph below each table\n5. Update tables quarterly to keep data current' }
              ]
            }
          },
          {
            id: 'p3-c1-i7',
            text: 'Ensure content sections are self-contained and independently citable',
            detail: 'Write each section so it can be extracted by AI engines and still make complete sense without surrounding context.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Self-Contained Content Sections',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines extract individual sections, not entire pages. If your section references "as mentioned above" or assumes context from previous paragraphs, the extracted answer is confusing and incomplete. Self-contained sections get cited more because they deliver complete answers independently.' },
                { heading: 'The Self-Containment Test', body: 'Read each section in isolation. Does it make sense without reading anything else on the page? Does it answer a specific question completely? Could someone understand the key point from just this section? If any answer is no, the section needs rewriting.' },
                { heading: 'Implementation', body: 'Each section should: start with a clear topic sentence, define any terms it uses, include the key takeaway within the first 2-3 sentences, not rely on pronouns that reference other sections, and end with a clear conclusion. Use descriptive headings that function as standalone labels.' },
                { heading: 'Action Items', body: '1. Run the self-containment test on your top 20 pages\n2. Rewrite sections that fail the test\n3. Replace cross-references with brief inline explanations\n4. Ensure each H2/H3 section can stand alone as a complete answer\n5. Add this test to your content review checklist' }
              ]
            }
          },
          {
            id: 'p3-c1-i8',
            text: 'Optimize headlines and metadata for AI answer extraction',
            detail: 'Rewrite page titles and meta descriptions so they serve as concise answers AI engines can directly reference.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Headlines and Metadata for AI Extraction',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines use your title tag and meta description as high-signal summaries of page content. If these are vague, clickbait-style, or keyword-stuffed, AI engines may skip your content for clearer alternatives. Well-crafted metadata acts as a pre-written answer AI can cite directly.' },
                { heading: 'Headline Patterns That Work', body: 'Use question-answer format: "What Is AEO? Answer Engine Optimization Explained." Use definition format: "Schema Markup: The Complete Guide to Structured Data." Use how-to format: "How to Implement FAQ Schema in 5 Steps." Avoid: vague titles, excessive punctuation, or titles that do not reveal what the page answers.' },
                { heading: 'Meta Description Strategy', body: 'Write meta descriptions as 150-160 character direct answers. Start with the key fact or answer. Include your brand as the authority. Example: "AEO (Answer Engine Optimization) is the practice of optimizing content for AI search engines like ChatGPT and Perplexity. Here is how to implement it."' },
                { heading: 'Action Items', body: '1. Audit titles and metas on your top 50 pages\n2. Rewrite vague or clickbait titles to be descriptive\n3. Make every meta description a standalone answer\n4. Include target question keywords naturally\n5. A/B test new titles via Search Console CTR data' }
              ]
            }
          },
          {
            id: 'p3-c1-i9',
            text: 'Structure content as self-contained 300-800 word chunks per H2 section',
            detail: 'Organize content so each H2 section is a semantically complete, independently retrievable passage optimized for AI RAG (Retrieval-Augmented Generation) systems.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Content Chunking for AI RAG Systems',
              sections: [
                { heading: 'Why This Matters', body: 'Modern AI search engines use RAG (Retrieval-Augmented Generation) to find answers. RAG systems break web pages into passages or "chunks" and retrieve the most relevant ones to generate answers. If your content sections are too short (under 300 words), they lack context. If too long (over 800 words), they dilute the key answer. Self-contained chunks of 300-800 words per H2 section are the sweet spot for RAG retrieval accuracy.' },
                { heading: 'What Makes a Good Chunk', body: 'Each H2 section should: answer a specific question completely, make sense without reading any other section, define any terms it uses, include the key takeaway in the first 2-3 sentences, and end with a clear conclusion. Think of each section as a standalone mini-article that could be extracted and presented as a complete answer.' },
                { heading: 'How to Restructure', body: 'Audit your top pages for section length and completeness. Split sections over 800 words into logical sub-sections with H3 headings. Expand sections under 300 words with supporting context. Remove cross-references like "as mentioned above" — each section should stand alone. Use the self-containment test: read each section in isolation and verify it makes complete sense.' },
                { heading: 'Action Items', body: '1. Audit your top 20 pages for section lengths\n2. Split oversized sections (800+ words) into focused sub-sections\n3. Expand thin sections (under 300 words) with context\n4. Remove cross-section references and dependencies\n5. Run the self-containment test on each section\n6. Verify each H2 section answers one clear question\n7. Monitor which sections get cited by AI engines to validate your chunking' }
              ]
            }
          }
        ]
      },
      {
        id: 'p3-content-quality',
        name: 'Content Quality & E-E-A-T',
        items: [
          {
            id: 'p3-c2-i1',
            text: 'Author bios with credentials + Person schema',
            detail: 'Add detailed author information with qualifications and link to Person schema.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Author Bios and Person Schema',
              sections: [
                { heading: 'Why This Matters', body: 'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is weighted more heavily in AI search. Author bios with real credentials signal expertise. Person schema makes author entities machine-readable and connects to the knowledge graph.' },
                { heading: 'What to Include', body: 'Full name, job title, relevant credentials/certifications, years of experience, brief professional bio, links to social profiles (LinkedIn, Twitter), headshot photo. For medical/legal/financial content, professional licenses are essential.' },
                { heading: 'Person Schema', body: 'Add @type: Person with name, jobTitle, description, image, sameAs (social URLs), affiliation, alumniOf, knowsAbout. Link from Article schema\'s author property to this Person entity.' },
                { heading: 'Action Items', body: '1. Create detailed author bios for all content creators\n2. Implement Person schema for each author\n3. Link author bios from Article schema\n4. Add social profile links in sameAs\n5. Create dedicated author pages' }
              ]
            }
          },
          {
            id: 'p3-c2-i2',
            text: 'Original data, research, case studies',
            detail: 'Create and publish original research, data, and case studies that AI engines can cite.',
            action: { view: 'content-ops', label: 'Open Content Ops' },
            doc: {
              title: 'Original Research and Data',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines strongly prefer citing primary sources with original data. If you generate unique research, surveys, or case studies, you become the authoritative source that both AI engines and other sites cite. This is the highest-value AEO content you can create.' },
                { heading: 'Types of Original Content', body: 'Industry surveys and reports. Internal data analysis. Case studies with real metrics. A/B test results. Benchmarking studies. Expert interviews with unique insights. Original frameworks or methodologies.' },
                { heading: 'How to Optimize for AI Citation', body: 'Include specific numbers and statistics prominently. Use clear data visualization. State findings in extractable paragraphs. Include methodology for credibility. Use Dataset schema for structured data. Make key findings available in the first few paragraphs.' },
                { heading: 'Action Items', body: '1. Identify unique data your business generates\n2. Plan 2-4 original research pieces per year\n3. Format findings for easy AI extraction\n4. Add Dataset schema where applicable\n5. Promote research for backlinks and citations' }
              ]
            }
          },
          {
            id: 'p3-c2-i3',
            text: "'Last Updated' dates (visible + dateModified schema)",
            detail: 'Show visible update dates and include dateModified in schema markup.',
            action: { view: 'schema', label: 'Open Schema Generator' },
            doc: {
              title: 'Content Freshness Signals',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines prioritize fresh content, especially for topics that change over time. Visible "Last Updated" dates and dateModified schema signals tell AI engines your content is current and maintained. Stale content loses citations over time.' },
                { heading: 'Implementation', body: 'Display a visible "Last Updated: [date]" on every article/page. Include dateModified in your Article/BlogPosting schema. Ensure the visible date and schema date match exactly. Only update the date when you make substantive content changes.' },
                { heading: 'Best Practices', body: 'Don\'t fake update dates — changing a comma and updating the date hurts trust. Set a content refresh schedule. Prioritize updating high-traffic and high-citation pages. Include a changelog or "What\'s New" section for major updates.' },
                { heading: 'Action Items', body: '1. Add visible "Last Updated" dates to all content\n2. Ensure dateModified schema is present and accurate\n3. Create a content refresh schedule\n4. Prioritize updating pages that AI engines cite\n5. Only update dates for substantive changes' }
              ]
            }
          },
          {
            id: 'p3-c2-i4',
            text: 'Cite authoritative external sources',
            detail: 'Reference and link to authoritative sources to build trust and demonstrate research.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'External Source Citations',
              sections: [
                { heading: 'Why This Matters', body: 'Content that cites authoritative sources is perceived as more trustworthy by AI engines. Just like academic papers gain credibility from their references, web content that links to and cites recognized authorities signals quality and thoroughness.' },
                { heading: 'How to Cite Effectively', body: 'Link to primary sources (research papers, official documentation, government data). Cite specific statistics with source attribution. Use descriptive anchor text that names the source. Include a references or sources section for longer content.' },
                { heading: 'Source Selection', body: 'Prioritize: government sites (.gov), educational institutions (.edu), peer-reviewed research, established industry organizations, recognized news outlets. Avoid: random blogs, outdated sources, competitors (unless necessary for comparison).' },
                { heading: 'Action Items', body: '1. Audit top content for source citations\n2. Add 3-5 authoritative citations per major article\n3. Use descriptive anchor text\n4. Verify all cited sources are current\n5. Refresh citations when sources update' }
              ]
            }
          },
          {
            id: 'p3-c2-i5',
            text: 'Topic clusters (pillar + 5-15 supporting pages)',
            detail: 'Build topical authority through pillar pages linked to supporting content.',
            action: { view: 'content-ops', label: 'Open Content Ops' },
            doc: {
              title: 'Topic Cluster Strategy',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines evaluate topical authority — how thoroughly you cover a subject. A topic cluster with a comprehensive pillar page and 5-15 supporting pages signals that you are a deep authority on the topic, making all your content more likely to be cited.' },
                { heading: 'Cluster Structure', body: 'Pillar page: Comprehensive overview covering all aspects of a topic (2000-5000 words). Supporting pages: Deep dives into specific subtopics (800-2000 words each). Internal linking: Every supporting page links to the pillar and vice versa. Supporting pages link to each other where relevant.' },
                { heading: 'Building a Cluster', body: 'Choose a core topic. Research all subtopics and questions. Create the pillar page first. Build supporting pages targeting specific sub-questions. Interlink everything. Use consistent terminology across all pages in the cluster.' },
                { heading: 'Action Items', body: '1. Identify 3-5 core topics for your business\n2. Research subtopics and questions for each\n3. Create or update pillar pages\n4. Build 5-15 supporting pages per pillar\n5. Implement comprehensive internal linking\n6. Review and expand clusters quarterly' }
              ]
            }
          },
          {
            id: 'p3-c2-i6',
            text: 'Natural, conversational writing style',
            detail: 'Write in a style that matches how AI engines present information and how users ask questions.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Conversational Writing for AEO',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines synthesize answers that sound natural and conversational. Content written in a natural, clear style is easier for AI to extract and present. Overly formal, jargon-heavy, or marketing-speak content gets skipped in favor of clear, direct language.' },
                { heading: 'Writing Guidelines', body: 'Use second person ("you") for direct engagement. Keep sentences under 25 words on average. Avoid jargon unless defining it for your audience. Write at an 8th-10th grade reading level. Use active voice. Be direct — get to the point quickly.' },
                { heading: 'Conversational Patterns', body: 'Mirror how users phrase questions in your answers. Use transitional phrases that flow naturally. Include examples that make concepts concrete. Break up text with headings, lists, and short paragraphs. Read your content aloud — if it sounds robotic, rewrite it.' },
                { heading: 'Action Items', body: '1. Run readability analysis on top content\n2. Simplify language where possible\n3. Replace jargon with plain language\n4. Use active voice consistently\n5. Read content aloud to check naturalness' }
              ]
            }
          },
          {
            id: 'p3-c2-i7',
            text: 'Include specific statistics, data points, and numbers in key content',
            detail: 'Embed sourced statistics, numerical data, and quantitative evidence within your content. Research shows pages with concrete data earn significantly more AI citations.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Statistics and Data Integration for AI Citations',
              sections: [
                { heading: 'Why This Matters', body: 'Research from Princeton and Georgia Tech (the GEO study) found that adding specific statistics to content boosts AI citation probability by over 5.5%. Pages with concrete data points, percentages, and numerical evidence are cited approximately 4x more frequently by AI engines than pages with only qualitative claims. AI systems prefer verifiable, specific information over vague generalizations.' },
                { heading: 'Types of Data to Include', body: 'Embed these types of data in your content: industry statistics with source attribution, survey results and sample sizes, performance metrics and benchmarks, year-over-year comparisons, cost and pricing data, usage statistics, and original research findings. Always cite the source and date — AI engines weight recent, well-sourced data more heavily.' },
                { heading: 'How to Integrate Effectively', body: 'Lead with data in your answer paragraphs: "According to [Source], 73% of..." Place key statistics in the first 2 sentences of each section. Use data tables for comparisons. Include the methodology or sample size for credibility. Format numbers consistently. Update statistics annually to maintain freshness signals.' },
                { heading: 'Action Items', body: '1. Audit your top 20 pages for data density\n2. Add 3-5 sourced statistics per major article\n3. Place key data points in opening paragraphs\n4. Use data tables where comparisons are relevant\n5. Include source attribution and dates for all statistics\n6. Create a statistics refresh schedule (quarterly or annually)\n7. Track which data-rich pages get cited most by AI engines' }
              ]
            }
          },
          {
            id: 'p3-c2-i8',
            text: 'Add expert quotes with attribution to authoritative content',
            detail: 'Embed direct quotes from recognized experts, research papers, or industry leaders within your content to boost trust signals and AI citation probability.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Expert Quotation Strategy for AEO',
              sections: [
                { heading: 'Why This Matters', body: 'The Princeton GEO (Generative Engine Optimization) study identified "Quotation Addition" as one of the top-performing optimization methods for AI citations. Direct quotes from recognized experts provide trust signals that AI engines weigh when selecting content to cite. Quotes are particularly effective in domains involving opinion, people, society, and expert knowledge.' },
                { heading: 'What Makes an Effective Quote', body: 'Use quotes from: named individuals with verifiable credentials, published research papers, recognized industry leaders, official reports from trusted organizations, and subject matter experts with public profiles. The quote should add unique insight — not just restate what your content already says. Include the person\'s name, title, and organization for full attribution.' },
                { heading: 'How to Source and Place Quotes', body: 'Source quotes from: interviews you conduct, published research papers, conference presentations, official press releases, and expert commentary platforms (HARO, Qwoted). Place quotes near the claims they support. Use blockquote formatting for visual distinction. Ensure the quoted expert is genuinely authoritative in the specific topic — relevance matters more than fame.' },
                { heading: 'Action Items', body: '1. Identify your top 10 content pages that would benefit from expert quotes\n2. Source 1-2 relevant expert quotes per page\n3. Use proper attribution: name, title, organization\n4. Place quotes near related claims for contextual support\n5. Use blockquote HTML formatting\n6. Consider conducting original interviews for unique quotes\n7. Update quotes when newer expert commentary becomes available' }
              ]
            }
          }
        ]
      },
      {
        id: 'p3-question-content',
        name: 'Question-First Content',
        items: [
          {
            id: 'p3-c3-i1',
            text: 'Dedicated Q&A sections on every key page (5-10 questions)',
            detail: 'Add structured Q&A sections with 5-10 relevant questions on important pages.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Page-Level Q&A Sections',
              sections: [
                { heading: 'Why This Matters', body: 'Dedicated Q&A sections are AEO gold. They provide AI engines with clearly formatted question-answer pairs that map directly to user queries. A page with a robust Q&A section is far more likely to be cited than one without.' },
                { heading: 'How to Create', body: 'Add a Q&A section (usually near the bottom, before the conclusion) with 5-10 questions related to the page topic. Each question gets a concise 40-60 word answer. Format with clear Q: and A: or use H3 headings for questions. Add FAQPage schema.' },
                { heading: 'Question Selection', body: 'Pull from: People Also Ask data, your search query reports, customer support inquiries, sales team FAQs, competitor FAQ sections, and AlsoAsked/AnswerThePublic data. Choose questions that are genuinely useful, not filler.' },
                { heading: 'Action Items', body: '1. Identify your top 20 key pages\n2. Research 5-10 relevant questions for each\n3. Write concise answers (40-60 words each)\n4. Add FAQPage schema to each Q&A section\n5. Validate schema and test in Rich Results Tool' }
              ]
            }
          },
          {
            id: 'p3-c3-i2',
            text: 'People Also Ask targeted content clusters',
            detail: 'Create content targeting People Also Ask questions in your niche.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'People Also Ask Content Strategy',
              sections: [
                { heading: 'Why This Matters', body: 'People Also Ask (PAA) questions directly reflect what users are asking about your topics. Google AI Overviews and other AI engines draw from the same question data. Targeting PAA queries is one of the most efficient AEO strategies because the questions are already validated by real user behavior.' },
                { heading: 'How to Research PAA', body: 'Search your core queries in Google and expand all PAA questions. Use tools like AlsoAsked.com to map the full PAA tree. Export and categorize by theme. Look for patterns in question types and phrasing.' },
                { heading: 'Content Strategy', body: 'Create dedicated content pages answering clusters of related PAA questions. Include the exact question as a heading and answer it directly in the first paragraph. Group 5-8 related PAA questions per page. Add FAQPage schema for each.' },
                { heading: 'Action Items', body: '1. Research PAA questions for top 20 queries\n2. Categorize by theme and intent\n3. Create content targeting PAA clusters\n4. Use exact question phrasing in headings\n5. Monitor PAA positions weekly' }
              ]
            }
          },
          {
            id: 'p3-c3-i3',
            text: 'Long-tail conversational query optimization',
            detail: 'Optimize for natural-language, long-tail queries that users type into AI assistants.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Long-Tail Conversational Query Optimization',
              sections: [
                { heading: 'Why This Matters', body: 'Users interact with AI assistants using natural language, creating long-tail queries like "what\'s the best way to optimize my website for AI search engines in 2025." Optimizing for these conversational queries captures traffic that traditional SEO misses.' },
                { heading: 'How to Identify Queries', body: 'Mine your search analytics for long phrases (5+ words). Use AI assistants themselves — type questions and see what they answer. Check chat logs if you have a chatbot. Look at forum questions in your niche (Reddit, Quora, Stack Exchange).' },
                { heading: 'Optimization Approach', body: 'Incorporate natural question phrasing into your content. Answer the long-tail query directly, then expand. Don\'t keyword-stuff — write naturally using the language patterns of real questions. Create content that answers multiple related long-tail queries.' },
                { heading: 'Action Items', body: '1. Identify long-tail query opportunities from analytics\n2. Create content answering natural-language questions\n3. Use conversational phrasing in headings and body\n4. Group related long-tail queries per page\n5. Monitor AI citation performance per query' }
              ]
            }
          },
          {
            id: 'p3-c3-i4',
            text: 'Entity-rich content defining relationships',
            detail: 'Create content that clearly defines entities and their relationships to build knowledge graph presence.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Entity-Rich Content for Knowledge Graphs',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines think in entities and relationships, not just keywords. Content that clearly defines entities (people, organizations, concepts, products) and their relationships feeds directly into knowledge graphs. This improves your visibility for entity-based queries across all AI platforms.' },
                { heading: 'Entity Definition', body: 'Use the "[Entity] is [definition]" pattern for every key entity on the page. Explicitly state relationships: "X is a product by Y, used for Z." Include entity attributes: founding date, location, category, related entities. Be specific and factual.' },
                { heading: 'Relationship Mapping', body: 'Explicitly define connections: "developed by," "part of," "alternative to," "used for," "located in." These relationship phrases help AI build accurate knowledge graph entries. Support with schema markup (sameAs, isPartOf, manufacturer, etc.).' },
                { heading: 'Action Items', body: '1. Identify key entities on your top pages\n2. Write clear definitions for each entity\n3. Explicitly state relationships between entities\n4. Support with relevant schema markup\n5. Cross-link entity definitions across your site' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'phase-4',
    number: 4,
    title: 'Technical AEO',
    color: '#10B981',
    icon: '\u2699\uFE0F',
    timeline: 'Week 4-6',
    description: 'Ensure your site is technically optimized for AI crawling, parsing, and content extraction.',
    categories: [
      {
        id: 'p4-crawlability',
        name: 'Crawlability',
        items: [
          {
            id: 'p4-c1-i1',
            text: 'AI bot access configuration in robots.txt',
            detail: 'Configure robots.txt specifically for optimal AI crawler access patterns.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Advanced AI Bot Configuration',
              sections: [
                { heading: 'Why This Matters', body: 'Beyond just allowing AI crawlers, you should optimize what they can access. Strategic robots.txt configuration ensures AI bots find your best content efficiently without wasting crawl budget on low-value pages.' },
                { heading: 'Configuration Strategy', body: 'Allow all AI bots access to content pages. Disallow admin, login, cart, and search result pages. Allow CSS and JS files (bots need these for rendering). Set a crawl-delay only if necessary for server performance. Reference your sitemap.' },
                { heading: 'Testing', body: 'Test with each bot\'s user-agent via curl. Monitor server logs for crawl patterns. Verify no critical content paths are blocked. Check Google Search Console for crawl errors that might indicate issues.' },
                { heading: 'Action Items', body: '1. Review and optimize robots.txt for AI bots\n2. Allow content directories, block admin/utility pages\n3. Ensure CSS/JS resources are accessible\n4. Test with curl for each AI bot user-agent\n5. Monitor crawl patterns in server logs' }
              ]
            }
          },
          {
            id: 'p4-c1-i7',
            text: 'Configure robots.txt to differentiate AI training bots vs AI search bots',
            detail: 'Allow AI search crawlers that drive citations (OAI-SearchBot, PerplexityBot) while optionally blocking training crawlers (GPTBot, Google-Extended) that consume content without direct attribution.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Training Bots vs Search Bots Configuration',
              sections: [
                { heading: 'Why This Matters', body: 'Not all AI crawlers serve the same purpose. OpenAI now operates two separate bots: GPTBot (collects data for model training) and OAI-SearchBot (powers ChatGPT\'s browsing and search citations). Similarly, Google-Extended is for AI training while Googlebot handles search indexing. Allowing search bots drives citations and traffic; allowing training bots contributes your content to model training without direct attribution. You may want different policies for each.' },
                { heading: 'Bot Classification', body: 'Training bots (contribute to model training): GPTBot (OpenAI), Google-Extended (Google AI/Gemini), CCBot (Common Crawl, used by many AI companies), Bytespider (ByteDance). Search/citation bots (drive actual citations and traffic): OAI-SearchBot (ChatGPT browsing), PerplexityBot (Perplexity.ai), ClaudeBot (Anthropic), Googlebot (Google Search/AI Overviews). Some bots serve dual purposes — ClaudeBot handles both training and search for Anthropic.' },
                { heading: 'Configuration Strategy', body: 'Option A (maximize visibility): Allow all bots — maximizes training inclusion and citation potential. Option B (citations only): Allow search bots, block training bots — protects content from training while maintaining citation eligibility. Option C (selective): Allow specific bots based on your priorities. Configure in robots.txt with separate User-agent directives for each bot.' },
                { heading: 'Action Items', body: '1. Decide your policy: allow all, citations only, or selective\n2. Identify which bots are training vs search crawlers\n3. Configure separate robots.txt rules for each category\n4. Test with curl to verify each bot\'s access\n5. Monitor server logs to confirm bots respect your rules\n6. Review and update quarterly as AI companies launch new bots' }
              ]
            }
          },
          {
            id: 'p4-c1-i6',
            text: 'Add llms.txt file to your website root',
            detail: 'Create a /llms.txt file that provides LLMs with a structured summary of your site, key pages, and documentation.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'llms.txt — The README for AI',
              sections: [
                { heading: 'Why This Matters', body: 'llms.txt is an emerging standard (proposed by Jina AI) that gives large language models a structured, human-readable summary of your site. While robots.txt controls crawler access, llms.txt tells AI what your site is about, which pages matter most, and where to find key information. Major companies like Anthropic, Cloudflare, and Stripe already publish one.' },
                { heading: 'What to Include', body: 'Your llms.txt should contain: a brief description of your site/company, links to your most important pages (with short descriptions), documentation links, API references if applicable, and any key facts you want AI to know. Keep it concise — think of it as a README for AI models.' },
                { heading: 'Format', body: 'Place at /llms.txt (website root). Use Markdown formatting. Start with a title (# Your Site Name), followed by a description, then organized sections with links. You can also create /llms-full.txt with more comprehensive information. There\'s no strict schema — clarity and completeness are what matter.' },
                { heading: 'Example Structure', body: '# Your Company Name\n\n> Brief description of what your company does.\n\n## Key Pages\n- [Homepage](https://yoursite.com): Main landing page\n- [Products](https://yoursite.com/products): Product catalog\n- [Blog](https://yoursite.com/blog): Industry insights\n\n## Documentation\n- [API Docs](https://yoursite.com/docs): Full API reference\n- [Getting Started](https://yoursite.com/start): Quick start guide' },
                { heading: 'Action Items', body: '1. Create /llms.txt at your website root\n2. Write a clear site description (2-3 sentences)\n3. List your most important pages with descriptions\n4. Include documentation and resource links\n5. Optionally create /llms-full.txt with expanded content\n6. Test by visiting yoursite.com/llms.txt in a browser\n7. Update whenever you add major new pages or sections' }
              ]
            }
          },
          {
            id: 'p4-c1-i8',
            text: 'Create llms-full.txt with complete documentation and key content',
            detail: 'Complement your llms.txt summary with a llms-full.txt file containing your complete documentation, guides, and key content in a single Markdown file for AI consumption.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'llms-full.txt — Complete Content for AI',
              sections: [
                { heading: 'Why This Matters', body: 'While llms.txt provides a curated summary, llms-full.txt gives AI systems your complete documentation and key content in a single, easily consumable Markdown file. Together they serve different needs: llms.txt is the executive summary; llms-full.txt is the comprehensive reference. AI models are actively crawling both files to build their understanding of websites and products.' },
                { heading: 'What to Include', body: 'Your llms-full.txt should contain: complete product documentation, detailed feature descriptions, API references, getting started guides, FAQ content, pricing details, use case descriptions, and any other content you want AI systems to have comprehensive access to. Organize with clear Markdown headings and structure.' },
                { heading: 'How to Create', body: 'Compile your most important documentation into a single Markdown file. Use clear heading hierarchy (H1 for main sections, H2 for subsections). Include internal links where relevant. Keep the file under 100KB for practical consumption. Update it whenever you publish significant new content or documentation changes. Reference llms-full.txt from your llms.txt file.' },
                { heading: 'Action Items', body: '1. Compile your key documentation into Markdown format\n2. Organize with clear heading hierarchy\n3. Place at /llms-full.txt at your website root\n4. Reference it from your llms.txt file\n5. Keep under 100KB for practical AI consumption\n6. Update when major content changes\n7. Test accessibility by visiting yoursite.com/llms-full.txt' }
              ]
            }
          },
          {
            id: 'p4-c1-i2',
            text: 'Semantic HTML5 throughout (<article>, <section>, <main>, etc.)',
            detail: 'Use proper HTML5 semantic elements to help AI parsers understand content structure.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Semantic HTML5 for AI Parsing',
              sections: [
                { heading: 'Why This Matters', body: 'Semantic HTML tells AI parsers what role each part of your page plays. A <main> tag identifies primary content. An <article> tag marks a self-contained piece. <section> groups related content. Without these, AI must guess what\'s content vs navigation vs footer — and may guess wrong.' },
                { heading: 'Key Elements', body: '<main> — one per page, wraps the primary content. <article> — self-contained, independently distributable content. <section> — thematic grouping of content. <nav> — navigation blocks. <aside> — tangentially related content (sidebars). <header>/<footer> — for the page and for articles. <figure>/<figcaption> — for images and their descriptions.' },
                { heading: 'Implementation', body: 'Wrap your main content area in <main>. Use <article> for blog posts, product listings, and standalone content. Use <section> within articles for major topic divisions. Use <nav> for all navigation menus. Never use <div> where a semantic element exists.' },
                { heading: 'Action Items', body: '1. Audit HTML templates for semantic element usage\n2. Replace generic <div>s with appropriate semantic elements\n3. Ensure one <main> per page\n4. Use <article> for all standalone content\n5. Validate HTML with W3C validator' }
              ]
            }
          },
          {
            id: 'p4-c1-i3',
            text: 'JS-rendered content also in initial HTML (SSR/SSG)',
            detail: 'Ensure content is available in the initial HTML response, not only after JavaScript execution.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Server-Side Rendering for AI Access',
              sections: [
                { heading: 'Why This Matters', body: 'Many AI crawlers don\'t execute JavaScript. If your content only appears after JS runs (client-side rendering), these crawlers see an empty page. Server-side rendering (SSR) or static site generation (SSG) ensures content is in the initial HTML response.' },
                { heading: 'How to Check', body: 'Use curl to fetch your page and check if content appears in the raw HTML. Disable JavaScript in your browser and load the page. If content disappears, you have a CSR problem. Check Google Search Console\'s URL Inspection tool — it shows both the raw HTML and rendered version.' },
                { heading: 'Solutions', body: 'SSR (Next.js, Nuxt, etc.): Server renders HTML on each request. SSG: Pre-builds HTML at build time — fastest and most reliable. Hybrid: SSG for most pages, SSR for dynamic content. Pre-rendering services: Use a service to pre-render JS pages for bots.' },
                { heading: 'Action Items', body: '1. Test key pages with curl for content in raw HTML\n2. Disable JS and check if content is visible\n3. Implement SSR or SSG if content requires JS\n4. Prioritize AEO-critical pages for server rendering\n5. Verify with Google URL Inspection tool' }
              ]
            }
          },
          {
            id: 'p4-c1-i4',
            text: 'Internal linking with descriptive anchor text',
            detail: 'Build a strong internal linking structure using keyword-rich, descriptive anchor text.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Internal Linking Strategy',
              sections: [
                { heading: 'Why This Matters', body: 'Internal links help AI crawlers discover and understand relationships between your content. Descriptive anchor text tells AI what the linked page is about before visiting it. A strong internal linking structure signals topical depth and helps distribute authority across your site.' },
                { heading: 'Best Practices', body: 'Use descriptive, keyword-rich anchor text (not "click here"). Link from high-authority pages to important target pages. Create contextual links within body content, not just navigation. Each page should have 3-5 internal links from other relevant pages.' },
                { heading: 'Strategy', body: 'Link pillar pages to all supporting pages and vice versa. Cross-link related content across topic clusters. Use breadcrumbs for hierarchical linking. Add "Related Content" sections at the bottom of articles. Update old content with links to new, relevant pages.' },
                { heading: 'Action Items', body: '1. Audit internal linking with a crawl tool\n2. Identify orphan pages (no internal links pointing to them)\n3. Add descriptive internal links to high-value pages\n4. Replace generic anchor text with descriptive text\n5. Implement "Related Content" sections' }
              ]
            }
          },
          {
            id: 'p4-c1-i5',
            text: 'Canonical URLs on all pages',
            detail: 'Set canonical URLs to prevent duplicate content and consolidate page authority.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Canonical URL Implementation',
              sections: [
                { heading: 'Why This Matters', body: 'Duplicate content confuses AI crawlers and dilutes page authority. Canonical tags tell search and AI engines which version of a page is the "official" one. Without them, AI engines may cite the wrong URL or ignore your content entirely due to duplication signals.' },
                { heading: 'Implementation', body: 'Add <link rel="canonical" href="https://yoursite.com/exact-url"> in the <head> of every page. The canonical URL should be the absolute, preferred URL. Self-referencing canonicals (pointing to the page itself) are a best practice for all pages.' },
                { heading: 'Common Issues', body: 'HTTP vs HTTPS canonical conflicts. www vs non-www inconsistencies. Trailing slash inconsistencies. Pagination canonicals pointing to page 1. Dynamic parameters creating multiple URLs for the same content.' },
                { heading: 'Action Items', body: '1. Implement self-referencing canonicals on all pages\n2. Audit for conflicting canonical signals\n3. Ensure canonicals use HTTPS and consistent domain format\n4. Handle pagination canonicals properly\n5. Monitor for new duplicate content issues' }
              ]
            }
          }
        ]
      },
      {
        id: 'p4-meta-feeds',
        name: 'Meta & Feed Optimization',
        items: [
          {
            id: 'p4-c2-i1',
            text: 'RSS/Atom feed with full content',
            detail: 'Provide RSS or Atom feeds with complete article content for AI engine consumption.',
            doc: {
              title: 'RSS/Atom Feeds for AEO',
              sections: [
                { heading: 'Why This Matters', body: 'RSS feeds provide AI engines with a structured, easily parseable feed of your content. Full-content feeds (not just excerpts) give AI crawlers complete article text without needing to visit each page individually, increasing the likelihood your content gets indexed and cited.' },
                { heading: 'Implementation', body: 'Generate an RSS 2.0 or Atom feed including: full article content (not truncated), publication dates, author information, categories/tags, and article URLs. Add a <link> tag in your HTML head pointing to the feed.' },
                { heading: 'Best Practices', body: 'Include full content, not just excerpts. Update the feed in real-time when content changes. Include 20-50 most recent items. Use proper encoding for special characters. Add the feed URL to your robots.txt Sitemap directive.' },
                { heading: 'Action Items', body: '1. Generate a full-content RSS/Atom feed\n2. Add feed discovery link in HTML head\n3. Include feed URL in robots.txt\n4. Verify feed validates with a feed validator\n5. Ensure feed updates when content changes' }
              ]
            }
          },
          {
            id: 'p4-c2-i2',
            text: 'Open Graph + Twitter Card meta tags',
            detail: 'Add comprehensive Open Graph and Twitter Card meta tags for social and AI sharing.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Open Graph and Twitter Card Tags',
              sections: [
                { heading: 'Why This Matters', body: 'Open Graph and Twitter Card tags provide structured metadata that AI platforms use when referencing and previewing your content. These tags define your content\'s title, description, image, and type in a standardized way that many AI systems read.' },
                { heading: 'Key Tags', body: 'og:title, og:description, og:image (1200x630px), og:url, og:type, og:site_name. Twitter: twitter:card (summary_large_image), twitter:title, twitter:description, twitter:image. Include on every page.' },
                { heading: 'Optimization', body: 'Write og:description as a concise answer (matches your 40-60 word answer paragraph). Use high-quality og:image. Ensure og:url matches the canonical URL. Test with Facebook Sharing Debugger and Twitter Card Validator.' },
                { heading: 'Action Items', body: '1. Implement OG tags on all pages\n2. Add Twitter Card tags\n3. Write answer-optimized descriptions\n4. Create proper og:image for each page type\n5. Test with platform validation tools' }
              ]
            }
          },
          {
            id: 'p4-c2-i3',
            text: 'Knowledge-graph optimized meta descriptions (answer-first)',
            detail: 'Write meta descriptions that lead with the answer and are optimized for AI extraction.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Answer-First Meta Descriptions',
              sections: [
                { heading: 'Why This Matters', body: 'Meta descriptions are one of the first pieces of content AI engines read. An answer-first meta description gives AI a concise answer before it even parses the full page. Some AI systems use meta descriptions as quick-reference summaries.' },
                { heading: 'How to Write', body: 'Start with the direct answer to the page\'s primary question. Include the target entity and key terms. Keep under 155 characters. Make it a complete, useful statement — not a teaser. Every meta description should be a viable AI answer on its own.' },
                { heading: 'Examples', body: 'Bad: "Learn everything you need to know about AEO in our comprehensive guide."\nGood: "AEO (Answer Engine Optimization) is the practice of optimizing content to be cited by AI search engines like ChatGPT, Perplexity, and Google AI Overviews."' },
                { heading: 'Action Items', body: '1. Audit all meta descriptions for answer-first format\n2. Rewrite using the direct answer approach\n3. Include target entity in each description\n4. Keep under 155 characters\n5. Ensure uniqueness across all pages' }
              ]
            }
          },
          {
            id: 'p4-c2-i4',
            text: 'Hreflang for multilingual content',
            detail: 'Implement hreflang tags to help AI engines serve the right language version.',
            doc: {
              title: 'Hreflang for Multilingual AEO',
              sections: [
                { heading: 'Why This Matters', body: 'If you have content in multiple languages, hreflang tags tell AI engines which version to serve to users in different regions. Without these, AI engines may cite the wrong language version or see your translations as duplicate content.' },
                { heading: 'Implementation', body: 'Add <link rel="alternate" hreflang="xx" href="url"> tags in the head of each page. Include self-referencing hreflang. Add an x-default for the fallback version. Can also be implemented via HTTP headers or in the sitemap.' },
                { heading: 'Best Practices', body: 'Use correct language codes (en-US, not just en). Every language version must reference all other versions (reciprocal). Include x-default. Ensure hreflang URLs match canonical URLs. Validate with hreflang testing tools.' },
                { heading: 'Action Items', body: '1. Identify all multilingual content pairs\n2. Implement hreflang tags on all language versions\n3. Include self-referencing and x-default\n4. Validate with hreflang checker tools\n5. Add hreflang to sitemap as alternative' }
              ]
            }
          },
          {
            id: 'p4-c2-i5',
            text: 'Comprehensive glossary/knowledge base section',
            detail: 'Create a glossary or knowledge base that defines key terms in your industry.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'Glossary and Knowledge Base',
              sections: [
                { heading: 'Why This Matters', body: 'A comprehensive glossary is an AEO powerhouse. It provides AI engines with clear, definition-style answers for every key term in your niche. Glossary pages are frequently cited by AI engines for "what is" queries and serve as an authority signal.' },
                { heading: 'Structure', body: 'Create a main glossary index page linking to individual term pages (or anchor links for smaller glossaries). Each term should have: the term as a heading, a 40-60 word definition, expanded explanation, related terms, and links to relevant content.' },
                { heading: 'Schema', body: 'Use DefinedTermSet and DefinedTerm schema. Alternatively, use FAQPage schema if structured as Q&A. Include glossary pages in your sitemap. Cross-link between glossary entries and main content.' },
                { heading: 'Action Items', body: '1. List all key terms in your industry (50-100+)\n2. Write clear definitions for each (40-60 words)\n3. Create glossary page(s) with proper structure\n4. Add schema markup\n5. Cross-link from main content to glossary entries' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'phase-5',
    number: 5,
    title: 'Authority & Trust Signals',
    color: '#F59E0B',
    icon: '\u{1F3C6}',
    timeline: 'Week 6-12+',
    description: 'Build brand authority and trust signals that AI engines use to evaluate source credibility.',
    categories: [
      {
        id: 'p5-brand-entity',
        name: 'Brand Entity',
        items: [
          {
            id: 'p5-c1-i1',
            text: 'Google Business Profile optimized',
            detail: 'Complete and optimize your Google Business Profile for brand entity establishment.',
            action: { external: 'https://business.google.com/', label: 'Open Google Business' },
            doc: {
              title: 'Google Business Profile Optimization',
              sections: [
                { heading: 'Why This Matters', body: 'Google Business Profile is a key component of your brand entity in the knowledge graph. AI engines reference GBP data for business information. A complete, optimized profile strengthens your brand entity signals across all AI platforms.' },
                { heading: 'Key Optimizations', body: 'Complete every field: business name, category, description, hours, photos, services, products, Q&A. Post regularly. Respond to all reviews. Add relevant attributes. Ensure NAP (Name, Address, Phone) matches your website and all directories.' },
                { heading: 'AEO-Specific Actions', body: 'Write a keyword-rich business description. Use the Q&A feature to add pre-answered FAQs. Post content that reinforces your expertise. Add product/service details that match your website schema.' },
                { heading: 'Action Items', body: '1. Claim and verify your Google Business Profile\n2. Complete every available field\n3. Add high-quality photos\n4. Set up regular posting schedule\n5. Add Q&A with pre-answered questions\n6. Respond to all reviews promptly' }
              ]
            }
          },
          {
            id: 'p5-c1-i2',
            text: 'Wikipedia/Wikidata entries if eligible',
            detail: 'Establish Wikipedia and Wikidata presence for strong knowledge graph integration.',
            action: { external: 'https://www.wikidata.org/', label: 'Open Wikidata' },
            doc: {
              title: 'Wikipedia and Wikidata Presence',
              sections: [
                { heading: 'Why This Matters', body: 'Wikipedia and Wikidata are primary sources for AI knowledge graphs. Having entries there establishes your brand as a recognized entity. AI engines frequently reference Wikipedia data when answering questions about organizations, products, and people.' },
                { heading: 'Eligibility', body: 'Wikipedia requires "notability" — significant coverage in reliable secondary sources. Not every business qualifies. Check if you have been covered by major publications, won industry awards, or have other verifiable third-party recognition. Don\'t create a page if you don\'t meet notability criteria — it will be deleted.' },
                { heading: 'Wikidata Alternative', body: 'Wikidata has lower notability requirements and is also used by AI systems. Create a Wikidata item for your organization with: name, description, official website, social media links, founding date, and other relevant properties. This feeds into knowledge graphs even without Wikipedia.' },
                { heading: 'Action Items', body: '1. Assess Wikipedia notability criteria\n2. Gather reliable secondary sources if eligible\n3. Create a Wikidata entry with complete properties\n4. If eligible, hire an experienced Wikipedia editor (don\'t self-create)\n5. Keep entries accurate and updated' }
              ]
            }
          },
          {
            id: 'p5-c1-i3',
            text: 'Consistent NAP across all directories',
            detail: 'Ensure Name, Address, Phone consistency across all business directories and citations.',
            doc: {
              title: 'NAP Consistency',
              sections: [
                { heading: 'Why This Matters', body: 'Name, Address, Phone (NAP) consistency across the web is a fundamental entity verification signal. AI engines cross-reference business information across directories. Inconsistencies create confusion about your entity and reduce trust scores.' },
                { heading: 'How to Audit', body: 'Search your business name across major directories: Google, Bing, Yelp, Facebook, Apple Maps, LinkedIn, industry-specific directories. Check for: exact name match, address format consistency, phone number format, and website URL consistency.' },
                { heading: 'Fixing Inconsistencies', body: 'Choose one canonical version of your NAP. Update all directories to match exactly. Use a citation management service (BrightLocal, Yext, Moz Local) for efficiency. Set a quarterly audit schedule to catch new inconsistencies.' },
                { heading: 'Action Items', body: '1. Define your canonical NAP format\n2. Audit top 20 directories for consistency\n3. Fix all inconsistencies\n4. Use citation management tools\n5. Schedule quarterly NAP audits' }
              ]
            }
          },
          {
            id: 'p5-c1-i4',
            text: 'Knowledge panel optimization',
            detail: 'Optimize for and maintain your Google Knowledge Panel to strengthen brand entity.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Knowledge Panel Optimization',
              sections: [
                { heading: 'Why This Matters', body: 'A Google Knowledge Panel is visible proof that Google recognizes your brand as an entity. AI engines use knowledge panel data when answering brand-related queries. Claiming and optimizing your panel strengthens your brand entity signals.' },
                { heading: 'How to Get One', body: 'Knowledge panels are automatically generated when Google has enough data. Improve your chances: complete Google Business Profile, create Wikipedia/Wikidata entries, ensure consistent structured data across your site, get mentioned in authoritative sources.' },
                { heading: 'Claiming and Optimizing', body: 'Search your brand name in Google. If a Knowledge Panel appears, click "Claim this knowledge panel." Verify ownership. Once claimed, you can suggest edits to information, add social profiles, and upload a featured image.' },
                { heading: 'Action Items', body: '1. Search your brand name for existing Knowledge Panel\n2. Claim the panel if it exists\n3. Optimize all panel fields\n4. If no panel exists, strengthen entity signals\n5. Monitor panel accuracy regularly' }
              ]
            }
          },
          {
            id: 'p5-c1-i5',
            text: 'Featured on authoritative industry sites',
            detail: 'Get your brand featured or cited on recognized industry authority websites.',
            doc: {
              title: 'Industry Authority Features',
              sections: [
                { heading: 'Why This Matters', body: 'Being featured on authoritative industry sites creates backlinks and brand mentions that AI engines use to evaluate your authority. Co-occurrence with established brands and publications builds your entity\'s trust signals in AI knowledge bases.' },
                { heading: 'Strategies', body: 'Contribute expert guest posts to industry publications. Participate in industry roundups and surveys. Speak at conferences and events (talk pages link to speakers). Get listed in industry directories and "best of" lists. Provide expert commentary to journalists (HARO, Qwoted).' },
                { heading: 'Measuring Impact', body: 'Track brand mentions across authoritative sites. Monitor new backlinks from industry sources. Check if AI engines cite these features when discussing your brand. Watch for Knowledge Panel changes after major features.' },
                { heading: 'Action Items', body: '1. List top 20 authoritative sites in your industry\n2. Develop relationships with editors/publishers\n3. Create pitch templates for guest content\n4. Sign up for HARO/journalist query services\n5. Track all industry features and citations' }
              ]
            }
          },
          {
            id: 'p5-c1-i6',
            text: 'Define and document your authority positioning strategy',
            detail: 'Choose how to position your brand as an authority — as an industry expert, data provider, educational hub, or community leader — and align all AEO content accordingly.',
            action: { view: 'content-ops', label: 'Open Content Ops' },
            doc: {
              title: 'Authority Positioning Strategy',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines give more citation weight to sources they recognize as authoritative in a specific domain. Without a deliberate strategy, your authority signals are scattered and weak. A clear positioning lets you concentrate effort where it builds the strongest reputation.' },
                { heading: 'Strategy Options', body: 'Industry Expert: Publish thought leadership, speak at events, contribute to industry publications. Data Provider: Produce original research, surveys, benchmarks that others cite. Educational Hub: Create the definitive guides and courses in your niche. Community Leader: Build forums, host events, curate expert roundups. Choose 1-2 that align with your strengths.' },
                { heading: 'Alignment Process', body: 'Once you choose your positioning: audit all existing content for alignment, create content guidelines that reinforce the strategy, ensure author bios reflect the chosen expertise area, align PR and outreach to support the positioning, and measure authority growth via citation tracking.' },
                { heading: 'Action Items', body: '1. Assess your current authority strengths honestly\n2. Choose 1-2 positioning strategies\n3. Document the strategy for your content team\n4. Audit existing content for alignment\n5. Create a 6-month authority building roadmap\n6. Track authority metrics monthly (citations, backlinks, brand mentions)' }
              ]
            }
          }
        ]
      },
      {
        id: 'p5-backlinks',
        name: 'Backlinks & Citations',
        items: [
          {
            id: 'p5-c2-i1',
            text: 'Topically relevant backlinks from authoritative domains',
            detail: 'Build backlinks from high-authority sites that are topically relevant to your content.',
            doc: {
              title: 'Authority Backlink Building',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines use backlink profiles as authority signals. A topically relevant backlink from an authoritative domain is a strong vote of confidence that increases the likelihood of your content being cited in AI answers. Quality matters more than quantity.' },
                { heading: 'Strategy', body: 'Focus on topical relevance first, domain authority second. Create linkable assets: original research, comprehensive guides, tools, templates. Build relationships in your industry. Pursue editorial backlinks through exceptional content.' },
                { heading: 'Outreach', body: 'Identify sites that link to competitors but not you. Offer genuinely useful content. Pitch with value — what does the linking site gain? Focus on building relationships, not transactional link exchanges.' },
                { heading: 'Action Items', body: '1. Audit your current backlink profile\n2. Identify topically relevant authority sites\n3. Create link-worthy content assets\n4. Develop an outreach strategy\n5. Track new backlinks monthly' }
              ]
            }
          },
          {
            id: 'p5-c2-i2',
            text: "Get cited as a source in others' content",
            detail: 'Build a reputation where other publishers cite your content as a reference source.',
            action: { view: 'competitors', label: 'Open Competitors' },
            doc: {
              title: 'Building Citation Authority',
              sections: [
                { heading: 'Why This Matters', body: 'When other publishers cite your content as a source, AI engines recognize you as a primary authority. These citations create a web of trust that AI systems use when deciding which sources to reference in their answers.' },
                { heading: 'How to Become Citable', body: 'Publish original data and statistics that others want to reference. Create definitive guides that become industry references. Maintain a regularly updated resource that people rely on. Provide unique insights, frameworks, or methodologies.' },
                { heading: 'Tracking Citations', body: 'Set up Google Alerts for your brand name and key content titles. Use Ahrefs/SEMrush to monitor who links to you. Check if AI engines cite your specific data or statistics. Track citation growth over time.' },
                { heading: 'Action Items', body: '1. Identify your most citable content assets\n2. Create 2-4 original data pieces per year\n3. Monitor citations and mentions\n4. Promote citable content to relevant audiences\n5. Update cited resources to maintain accuracy' }
              ]
            }
          },
          {
            id: 'p5-c2-i3',
            text: 'Presence on Reddit, Quora, Stack Exchange',
            detail: 'Build authentic presence on community platforms where AI engines source information.',
            doc: {
              title: 'Community Platform Presence',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines heavily reference community platforms — especially Reddit, Quora, and Stack Exchange. Having an authentic presence there means your expertise (and links to your site) appear in the very sources AI engines trust for real-world information and recommendations.' },
                { heading: 'Strategy', body: 'Provide genuinely helpful answers in your area of expertise. Don\'t spam links — build reputation first. Reference your content only when it genuinely adds value to the answer. Focus on subreddits, Quora spaces, and SE tags relevant to your niche.' },
                { heading: 'Best Practices', body: 'Be authentic and transparent about your affiliation. Follow each platform\'s self-promotion rules. Give complete answers (don\'t just link-dump). Build karma/reputation over time. Engage consistently, not just when you have something to promote.' },
                { heading: 'Action Items', body: '1. Identify relevant subreddits, Quora spaces, and SE tags\n2. Create accounts and build profile reputation\n3. Answer 5-10 questions per week in your niche\n4. Reference your content when genuinely relevant\n5. Monitor community discussions about your brand' }
              ]
            }
          },
          {
            id: 'p5-c2-i4',
            text: 'Press mentions and media coverage',
            detail: 'Secure press coverage and media mentions that build brand authority.',
            doc: {
              title: 'Press and Media Coverage',
              sections: [
                { heading: 'Why This Matters', body: 'Press mentions from recognized media outlets are among the strongest authority signals for AI engines. News sources are weighted heavily in knowledge graph construction and AI citation decisions. Media coverage validates your brand as noteworthy.' },
                { heading: 'How to Get Coverage', body: 'Create newsworthy content: original research, industry reports, product launches with genuine impact. Respond to journalist queries via HARO, Qwoted, and Help a B2B Writer. Build relationships with industry journalists. Issue press releases for significant developments.' },
                { heading: 'Measuring Impact', body: 'Track all press mentions with Google Alerts and media monitoring tools. Monitor whether AI engines reference press coverage when discussing your brand. Check Domain Authority improvements from media backlinks.' },
                { heading: 'Action Items', body: '1. Sign up for journalist query services\n2. Create a media kit and press page\n3. Identify journalists covering your industry\n4. Develop newsworthy content/announcements\n5. Track all press mentions and their impact' }
              ]
            }
          },
          {
            id: 'p5-c2-i5',
            text: 'Active social media with thought leadership',
            detail: 'Maintain active social media presence demonstrating expertise and thought leadership.',
            doc: {
              title: 'Social Media Thought Leadership',
              sections: [
                { heading: 'Why This Matters', body: 'Social media presence is a brand entity signal that AI engines consider. Active profiles with engaged audiences and thought leadership content strengthen your entity in knowledge graphs. AI engines also directly index content from platforms like LinkedIn and Twitter.' },
                { heading: 'Strategy', body: 'Focus on 2-3 platforms where your audience is most active. Share original insights, not just link promotion. Engage in industry conversations. Build a personal brand for key team members alongside the company brand.' },
                { heading: 'Content Approach', body: 'Share original perspectives on industry developments. Post data-driven insights. Engage authentically with peers and audience. Repurpose your best website content into social-native formats. Include your key expertise topics in bio/about sections.' },
                { heading: 'Action Items', body: '1. Identify 2-3 priority platforms\n2. Complete all profile information\n3. Create a consistent posting schedule\n4. Share original thought leadership content\n5. Include social URLs in Organization schema sameAs' }
              ]
            }
          },
          {
            id: 'p5-c2-i6',
            text: 'Create and optimize profiles on review platforms (G2, Capterra, Trustpilot, industry directories)',
            detail: 'Sites with profiles on 4+ review platforms are 3x more likely to be cited by ChatGPT. Create and maintain profiles on relevant review and directory platforms.',
            action: { external: 'https://www.g2.com/', label: 'Open G2' },
            doc: {
              title: 'Review Platform Profiles for AI Citations',
              sections: [
                { heading: 'Why This Matters', body: 'Research shows that brands with profiles on 4 or more review and directory platforms are approximately 3x more likely to appear in ChatGPT responses. Review platforms like G2, Capterra, Trustpilot, and Yelp are high-authority domains that AI engines frequently reference when answering product and service recommendation queries. Having a presence on these platforms feeds directly into the AI citation ecosystem.' },
                { heading: 'Key Platforms', body: 'General review platforms: Trustpilot, Google Reviews, Yelp, Better Business Bureau. Software/SaaS: G2, Capterra, TrustRadius, GetApp, Software Advice. B2B: Clutch, GoodFirms, DesignRush. Industry-specific: identify the top 3-5 directories in your specific industry. Professional: LinkedIn Company Page, Crunchbase. Choose platforms where your target audience actually looks for recommendations.' },
                { heading: 'How to Optimize Profiles', body: 'Complete every available field on each platform. Use consistent brand name, description, and value proposition across all profiles (matches your Organization schema and NAP). Upload high-quality logos and images. Actively collect and respond to reviews. Keep product/service information current. Link profiles to your website and each other.' },
                { heading: 'Action Items', body: '1. Identify 5-8 relevant review and directory platforms\n2. Create or claim your profile on each\n3. Complete all available profile fields\n4. Ensure brand description consistency across platforms\n5. Implement a review collection strategy\n6. Respond to all reviews (positive and negative)\n7. Update profiles quarterly to keep information current\n8. Add profile URLs to your Organization schema sameAs property' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'phase-6',
    number: 6,
    title: 'Testing & Validation',
    color: '#EC4899',
    icon: '\u{1F9EA}',
    timeline: 'Week 6-8',
    description: 'Systematically test your AEO implementation across all AI platforms and validate technical setup.',
    categories: [
      {
        id: 'p6-platform-testing',
        name: 'Platform Testing',
        items: [
          {
            id: 'p6-c1-i1',
            text: 'Test queries in ChatGPT (with browsing)',
            detail: 'Test your target queries in ChatGPT with browsing enabled to check for citations.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'ChatGPT Testing Protocol',
              sections: [
                { heading: 'Why This Matters', body: 'ChatGPT is the most widely used AI assistant. Testing your target queries reveals whether your content is being found and cited. ChatGPT with browsing uses Bing\'s index, so this also validates your Bing optimization.' },
                { heading: 'How to Test', body: 'Use ChatGPT Plus with browsing enabled. Ask your target queries in natural language. Check if your site appears in the cited sources. Try variations of each query. Test at different times (AI results can vary). Screenshot and log all results.' },
                { heading: 'What to Track', body: 'For each query: Was your site cited? What specific page was cited? What text was extracted? Where was it in the response (prominently or as a secondary source)? How did the answer compare to your content?' },
                { heading: 'Action Items', body: '1. Create a list of 20-50 target queries\n2. Test each in ChatGPT with browsing\n3. Log results with screenshots\n4. Note which content gets cited and which doesn\'t\n5. Compare against competitor citations' }
              ]
            }
          },
          {
            id: 'p6-c1-i2',
            text: 'Test queries in Perplexity.ai (shows sources explicitly)',
            detail: 'Use Perplexity.ai to test queries since it explicitly shows source citations.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Perplexity.ai Testing Protocol',
              sections: [
                { heading: 'Why This Matters', body: 'Perplexity.ai is the best platform for AEO testing because it explicitly shows every source it cites with numbered references. This makes it easy to verify exactly when and how your content is being used as an AI answer source.' },
                { heading: 'How to Test', body: 'Search each target query in Perplexity. Check the numbered source citations. Click through to verify your content is being accurately represented. Note the specific paragraphs or data points that get cited.' },
                { heading: 'Testing Strategy', body: 'Test broad queries and specific questions. Try different phrasings. Check both the free and Pro tiers if possible. Note how your citations compare to competitors. Pay attention to which page sections get cited.' },
                { heading: 'Action Items', body: '1. Test all target queries in Perplexity\n2. Track citation frequency and placement\n3. Note which content sections get cited\n4. Compare against competitor citation rates\n5. Log all results in your tracking spreadsheet' }
              ]
            }
          },
          {
            id: 'p6-c1-i3',
            text: 'Test in Google AI Overviews (incognito)',
            detail: 'Test target queries in Google to check AI Overview appearances.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Google AI Overview Testing',
              sections: [
                { heading: 'Why This Matters', body: 'Google AI Overviews appear above traditional search results for many queries. Being cited in AI Overviews is one of the highest-visibility AEO outcomes. Testing in incognito mode gives unbiased results not influenced by your search history.' },
                { heading: 'How to Test', body: 'Open Chrome in incognito mode. Search your target queries. Check if an AI Overview appears. If it does, check if your content is cited (look for the source links). Note which queries trigger AI Overviews and which don\'t.' },
                { heading: 'Important Notes', body: 'AI Overviews don\'t appear for all queries. They\'re more common for informational queries. Geographic location affects results. Test from multiple locations if possible. Results can change rapidly — test regularly.' },
                { heading: 'Action Items', body: '1. Test top queries in Google incognito mode\n2. Log which queries trigger AI Overviews\n3. Track your citation appearances\n4. Note competitor citations\n5. Re-test weekly to track changes' }
              ]
            }
          },
          {
            id: 'p6-c1-i4',
            text: 'Test in Bing Copilot',
            detail: 'Test queries in Bing Copilot for citation verification.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Bing Copilot Testing',
              sections: [
                { heading: 'Why This Matters', body: 'Bing Copilot (integrated into Edge and Bing) is powered by Microsoft\'s AI and uses Bing\'s search index. Since ChatGPT also uses Bing\'s index for browsing, your Bing Copilot results often predict ChatGPT citation behavior.' },
                { heading: 'How to Test', body: 'Open Bing.com or Microsoft Edge. Use the Copilot feature. Ask your target queries. Check the cited sources in responses. Compare results with ChatGPT testing.' },
                { heading: 'Tracking', body: 'Log citations, note differences from other platforms, track changes over time. Pay attention to whether Bing Copilot cites different pages than Google AI Overviews — this reveals platform-specific optimization opportunities.' },
                { heading: 'Action Items', body: '1. Test target queries in Bing Copilot\n2. Log all citations\n3. Compare with ChatGPT results\n4. Note platform-specific differences\n5. Optimize for Bing-specific factors if gaps found' }
              ]
            }
          },
          {
            id: 'p6-c1-i5',
            text: 'Test in Claude, Gemini, other AI assistants',
            detail: 'Test across all major AI platforms to ensure broad AEO coverage.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Multi-Platform AI Testing',
              sections: [
                { heading: 'Why This Matters', body: 'Each AI platform has different training data, indexing behavior, and citation patterns. Testing across all major platforms reveals gaps in your AEO strategy and ensures you\'re not optimized for just one engine while invisible to others.' },
                { heading: 'Platforms to Test', body: 'Claude (claude.ai) — Anthropic\'s AI. Gemini (gemini.google.com) — Google\'s AI. Other emerging platforms as they gain market share. Each may handle content discovery differently.' },
                { heading: 'Cross-Platform Analysis', body: 'Compare citation rates across platforms. Identify which platforms cite you most/least. Look for patterns: does one platform prefer different content formats? Do some platforms find different pages? This informs platform-specific optimization.' },
                { heading: 'Action Items', body: '1. Test top queries across all major AI platforms\n2. Log results per platform\n3. Identify cross-platform citation patterns\n4. Note platform-specific gaps\n5. Create platform-specific optimization plans if needed' }
              ]
            }
          }
        ]
      },
      {
        id: 'p6-technical-validation',
        name: 'Technical Validation',
        items: [
          {
            id: 'p6-c2-i1',
            text: 'Validate schema across all page templates',
            detail: 'Run schema validation on every unique page template to ensure zero errors.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Comprehensive Schema Validation',
              sections: [
                { heading: 'Why This Matters', body: 'Schema errors can prevent your structured data from being used by AI engines. Validating across all templates (not just one page) ensures consistent, error-free markup site-wide.' },
                { heading: 'Validation Process', body: 'List all unique page templates. Test one page of each type in Google Rich Results Test and Schema.org Validator. Fix all errors. Re-validate. Spot-check individual pages for template-specific issues.' },
                { heading: 'Common Issues', body: 'Missing required properties, incorrect data types, broken URLs, mismatched visible content and schema data, nesting errors, deprecated markup.' },
                { heading: 'Action Items', body: '1. List all unique page templates\n2. Validate each in both Google and Schema.org tools\n3. Fix all errors and warnings\n4. Re-validate after fixes\n5. Set up automated monitoring' }
              ]
            }
          },
          {
            id: 'p6-c2-i2',
            text: 'Test crawlability with AI bot user-agents (curl simulation)',
            detail: 'Simulate AI crawler requests to verify your content is accessible.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'AI Bot Crawlability Testing',
              sections: [
                { heading: 'Why This Matters', body: 'Just because you\'ve allowed AI bots in robots.txt doesn\'t mean they can access your content. Server-side rules, CDN settings, or WAF rules might block specific user-agents. Testing with curl simulates what AI crawlers actually experience.' },
                { heading: 'How to Test', body: 'Use curl commands with AI bot user-agents:\ncurl -A "GPTBot" https://yoursite.com/\ncurl -A "ClaudeBot" https://yoursite.com/\ncurl -A "PerplexityBot" https://yoursite.com/\n\nCheck for 200 status codes and verify the response contains your actual content.' },
                { heading: 'What to Check', body: 'Status code (should be 200). Content-Type header. Response body contains actual page content. No CAPTCHA or bot-blocking pages. JavaScript-dependent content is accessible. All important pages return content.' },
                { heading: 'Action Items', body: '1. Test 10 key pages with each AI bot user-agent\n2. Verify 200 status codes\n3. Check response content is complete\n4. Fix any blocked or degraded responses\n5. Test again after server/CDN changes' }
              ]
            }
          },
          {
            id: 'p6-c2-i3',
            text: 'Verify Bing Webmaster Tools indexation (critical for ChatGPT)',
            detail: 'Ensure your important pages are indexed in Bing since ChatGPT uses Bing for browsing.',
            action: { external: 'https://www.bing.com/webmasters', label: 'Open Bing Webmaster Tools' },
            doc: {
              title: 'Bing Indexation Verification',
              sections: [
                { heading: 'Why This Matters', body: 'ChatGPT with browsing and Bing Copilot both use Bing\'s index. If your pages aren\'t indexed in Bing, they\'re invisible to these platforms. Many sites focus only on Google indexation, creating a major AEO blind spot.' },
                { heading: 'How to Check', body: 'Log into Bing Webmaster Tools. Check the URL Inspection tool for key pages. Review the Page Indexing report for errors. Submit your sitemap if not already done. Use IndexNow for immediate URL submission.' },
                { heading: 'Common Issues', body: 'Pages indexed in Google but not Bing. Bing crawl rate too low. Sitemap not submitted to Bing. Bing-specific crawl errors. Content blocked for Bingbot but not Googlebot.' },
                { heading: 'Action Items', body: '1. Log into Bing Webmaster Tools\n2. Check indexation status of key pages\n3. Submit sitemap if not done\n4. Fix any Bing-specific crawl errors\n5. Implement IndexNow for fast indexing\n6. Monitor Bing indexation weekly' }
              ]
            }
          },
          {
            id: 'p6-c2-i4',
            text: 'Content extraction test (View Source check)',
            detail: 'Verify that your key content is in the page source HTML, not only rendered via JavaScript.',
            action: { view: 'analyzer', label: 'Open Analyzer' },
            doc: {
              title: 'Content Extraction Verification',
              sections: [
                { heading: 'Why This Matters', body: 'If your content is only available after JavaScript execution, many AI crawlers will miss it. Testing the raw HTML source ensures your answers and key content are accessible to all bots, regardless of their rendering capabilities.' },
                { heading: 'How to Test', body: 'Right-click > View Page Source (not Inspect Element). Search for your key answer paragraphs, headings, and schema markup. Use curl to fetch the raw HTML and search for content. If key content is missing from source, you need SSR/SSG.' },
                { heading: 'What to Verify', body: 'Answer paragraphs are in source HTML. All headings are present. Schema markup is rendered server-side. FAQ sections are in the initial HTML. Important text content isn\'t loaded via AJAX or lazy-loaded.' },
                { heading: 'Action Items', body: '1. View source on your top 10 pages\n2. Search for key answer paragraphs\n3. Verify schema markup is in source\n4. Fix any content only available via JS\n5. Test with curl for definitive results' }
              ]
            }
          },
          {
            id: 'p6-c2-i5',
            text: 'Benchmark page speed',
            detail: 'Establish speed benchmarks for key pages to track performance over time.',
            action: { external: 'https://pagespeed.web.dev/', label: 'Open PageSpeed Insights' },
            doc: {
              title: 'Page Speed Benchmarking',
              sections: [
                { heading: 'Why This Matters', body: 'Page speed affects both user experience and AI engine selection. Establishing benchmarks lets you track improvements and catch regressions. Faster pages are more likely to be crawled frequently and cited by AI engines.' },
                { heading: 'How to Benchmark', body: 'Run PageSpeed Insights on all key page templates. Record: Performance score, LCP, INP, CLS, TTFB, Total Blocking Time. Test both mobile and desktop. Use WebPageTest for more detailed waterfall data.' },
                { heading: 'Tracking', body: 'Create a spreadsheet with: page URL, date, and all metrics. Test monthly and after any major changes. Set alerts for regression. Compare against competitors.' },
                { heading: 'Action Items', body: '1. Run speed tests on all key page templates\n2. Record all metrics in a tracking spreadsheet\n3. Set monthly testing reminders\n4. Establish acceptable thresholds\n5. Set up automated monitoring (SpeedCurve, etc.)' }
              ]
            }
          }
        ]
      },
      {
        id: 'p6-testing-routine',
        name: 'Testing Routine',
        items: [
          {
            id: 'p6-c3-i1',
            text: 'Weekly AEO testing schedule (top 10 queries, 30 min)',
            detail: 'Establish a consistent weekly testing routine for your most important queries.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Weekly AEO Testing Schedule',
              sections: [
                { heading: 'Why This Matters', body: 'AI engine results change frequently. A weekly testing routine catches changes in citation behavior early, lets you respond to algorithm updates quickly, and provides trend data that informs your optimization strategy.' },
                { heading: 'Weekly Routine', body: 'Monday or Tuesday, 30 minutes: Test top 10 queries in Perplexity (10 min). Test top 10 queries in ChatGPT (10 min). Spot-check 5 queries in Google AI Overviews (5 min). Log all results (5 min). Note any changes from previous week.' },
                { heading: 'What to Track', body: 'Per query: cited/not cited/partial, which page was cited, position in response, any competitor changes, new queries that triggered citations.' },
                { heading: 'Action Items', body: '1. Select your top 10 most important queries\n2. Set a weekly calendar reminder\n3. Create a tracking spreadsheet\n4. Test consistently on the same day/time\n5. Review trends monthly' }
              ]
            }
          },
          {
            id: 'p6-c3-i2',
            text: 'AEO testing spreadsheet/tracker',
            detail: 'Create a structured spreadsheet to track AEO testing results across platforms.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'AEO Testing Tracker Setup',
              sections: [
                { heading: 'Why This Matters', body: 'Without systematic tracking, you can\'t measure AEO progress or identify trends. A well-structured tracker turns your testing routine into actionable data that guides optimization priorities.' },
                { heading: 'Tracker Structure', body: 'Columns: Query, Date, Platform (ChatGPT/Perplexity/Google AIO/Bing/Claude), Cited (Yes/No/Partial), Page Cited, Section Cited, Competitor Cited, Notes. One row per query per platform per test date.' },
                { heading: 'Metrics to Derive', body: 'AEO visibility score: % of queries where you\'re cited across all platforms. Platform coverage: which platforms cite you most. Trend direction: improving, stable, or declining. Competitive position: how you rank vs competitors.' },
                { heading: 'Action Items', body: '1. Create a tracking spreadsheet (or use the built-in tracker)\n2. Enter your target query list\n3. Record baseline results\n4. Update weekly with new test results\n5. Generate monthly trend reports' }
              ]
            }
          },
          {
            id: 'p6-c3-i3',
            text: 'Document baseline scores before optimization',
            detail: 'Record current AEO performance before making changes to measure impact.',
            action: { view: 'metrics', label: 'Open Metrics' },
            doc: {
              title: 'Baseline Documentation',
              sections: [
                { heading: 'Why This Matters', body: 'Without a documented baseline, you can\'t prove the impact of your AEO efforts. Baseline scores before optimization provide the "before" measurement that makes the "after" meaningful — for your team and for clients.' },
                { heading: 'What to Document', body: 'Current citation rate across all AI platforms. Current schema validation status. Current Core Web Vitals scores. Current content structure assessment. Current backlink profile. Current knowledge graph presence.' },
                { heading: 'How to Document', body: 'Create a comprehensive baseline report with screenshots. Run all analyses before starting optimization. Store raw data for comparison. Include dates for all measurements.' },
                { heading: 'Action Items', body: '1. Run full AEO analysis before optimization\n2. Screenshot all AI platform test results\n3. Record all technical metrics\n4. Store as a dated baseline report\n5. Compare against this baseline monthly' }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 'phase-7',
    number: 7,
    title: 'Monitor & Iterate',
    color: '#EF4444',
    icon: '\u{1F4C8}',
    timeline: 'Week 8+ ongoing',
    description: 'Establish ongoing monitoring, track results, and continuously improve AEO performance.',
    categories: [
      {
        id: 'p7-tracking',
        name: 'Tracking',
        items: [
          {
            id: 'p7-c1-i1',
            text: 'Monitor AI Overview appearances in GSC',
            detail: 'Track Google AI Overview appearances through Search Console reporting.',
            action: { view: 'gsc', label: 'Open Search Console' },
            doc: {
              title: 'Monitoring AI Overviews in Search Console',
              sections: [
                { heading: 'Why This Matters', body: 'Google Search Console provides data on when your pages appear in AI Overviews. Monitoring this data reveals which content is being selected, trending queries, and opportunities for improvement.' },
                { heading: 'How to Monitor', body: 'In GSC, check Performance report with "Search Appearance" filter for AI Overview. Track impressions, clicks, and CTR for pages appearing in AI Overviews. Compare with regular search performance.' },
                { heading: 'Analysis', body: 'Look for: Which pages appear most in AI Overviews. CTR differences between AI Overview and regular results. Queries triggering AI Overviews. New pages entering AI Overviews. Pages losing AI Overview placement.' },
                { heading: 'Action Items', body: '1. Set up GSC AI Overview monitoring\n2. Check weekly for new appearances\n3. Track CTR trends for AI Overview results\n4. Identify high-potential queries not yet in AI Overviews\n5. Optimize content for queries losing placement' }
              ]
            }
          },
          {
            id: 'p7-c1-i2',
            text: 'Track citations across all AI platforms monthly',
            detail: 'Conduct monthly tracking of your citations across all major AI platforms.',
            action: { view: 'metrics', label: 'Open Metrics' },
            doc: {
              title: 'Monthly AI Citation Tracking',
              sections: [
                { heading: 'Why This Matters', body: 'Monthly comprehensive tracking across all platforms gives you the full picture of your AEO performance. Individual platform checks miss the big picture. Monthly cadence balances thoroughness with time investment.' },
                { heading: 'What to Track', body: 'Test 50-100 queries across ChatGPT, Perplexity, Google AI Overviews, Bing Copilot, and Claude. Track: citation rate, citation quality (primary vs secondary source), accuracy of cited content, competitor citation comparisons.' },
                { heading: 'Reporting', body: 'Create a monthly AEO report with: overall visibility score, platform breakdown, query-level details, trend analysis, competitor comparison, and action items for next month.' },
                { heading: 'Action Items', body: '1. Expand query list to 50-100 queries\n2. Test across all platforms monthly\n3. Generate monthly AEO visibility report\n4. Compare against previous months\n5. Set monthly improvement targets' }
              ]
            }
          },
          {
            id: 'p7-c1-i3',
            text: 'Monitor referral traffic from AI sources',
            detail: 'Track traffic coming from AI platforms in your analytics.',
            action: { view: 'ga4', label: 'Open AI Traffic' },
            doc: {
              title: 'AI Referral Traffic Monitoring',
              sections: [
                { heading: 'Why This Matters', body: 'AI citations drive actual traffic to your site. Monitoring referral traffic from AI sources quantifies the business impact of your AEO efforts. This data justifies continued investment in AEO optimization.' },
                { heading: 'How to Track', body: 'In Google Analytics, check referral traffic from: chat.openai.com, perplexity.ai, and other AI domains. Set up custom segments for AI referral traffic. Track landing pages, engagement metrics, and conversions from these sources.' },
                { heading: 'Attribution', body: 'Note that not all AI-driven traffic is trackable — many users copy answers without clicking through. Consider AI referral traffic as a lower bound of your actual AEO impact. Survey users about how they found you to capture uncredited AI referrals.' },
                { heading: 'Action Items', body: '1. Set up AI referral tracking in analytics\n2. Create AI traffic segment/dashboard\n3. Monitor weekly for traffic trends\n4. Track conversions from AI referral traffic\n5. Report AI traffic growth to stakeholders' }
              ]
            }
          },
          {
            id: 'p7-c1-i4',
            text: 'Track featured snippet and PAA presence',
            detail: 'Monitor your appearance in featured snippets and People Also Ask boxes.',
            action: { view: 'gsc', label: 'Open Search Console' },
            doc: {
              title: 'Featured Snippet and PAA Tracking',
              sections: [
                { heading: 'Why This Matters', body: 'Featured snippets and PAA boxes are closely correlated with AI Overview citations. Pages winning these traditional rich results are strong candidates for AI engine citations. Tracking them provides an early indicator of AEO performance.' },
                { heading: 'Tracking Methods', body: 'Use SEO tools (Ahrefs, SEMrush, Sistrix) to track featured snippet ownership. Monitor PAA appearances for your target queries. Check GSC Search Appearance filters. Compare with previous periods.' },
                { heading: 'Optimization Loop', body: 'Pages losing featured snippets often lose AI citations too. When you lose a snippet, investigate what changed. Competitor content updates, freshness signals, and format changes are common causes.' },
                { heading: 'Action Items', body: '1. Set up featured snippet tracking in SEO tools\n2. Monitor PAA appearances weekly\n3. Investigate any snippet losses quickly\n4. Cross-reference with AI citation changes\n5. Optimize content to recapture lost positions' }
              ]
            }
          },
          {
            id: 'p7-c1-i5',
            text: 'Automated schema validation monitoring',
            detail: 'Set up automated monitoring to catch schema errors before they impact AEO.',
            action: { view: 'monitoring', label: 'Open Monitoring' },
            doc: {
              title: 'Automated Schema Monitoring',
              sections: [
                { heading: 'Why This Matters', body: 'Schema errors can appear after CMS updates, code deployments, or content changes. Automated monitoring catches these before they impact your AEO performance, preventing silent degradation of your structured data.' },
                { heading: 'Tools and Methods', body: 'Use Google Search Console Enhancement reports (checks automatically). Set up scheduled crawls with Screaming Frog or Sitebulb for schema validation. Implement automated testing in CI/CD pipeline. Use ContentKing or similar for real-time monitoring.' },
                { heading: 'Alert Setup', body: 'Configure alerts for: new schema errors in GSC, schema validation failures in CI/CD, pages losing structured data, and significant drops in rich result impressions.' },
                { heading: 'Action Items', body: '1. Enable GSC Enhancement report alerts\n2. Add schema validation to CI/CD pipeline\n3. Set up weekly automated crawl and validation\n4. Configure alerts for error detection\n5. Establish a fix SLA for schema errors' }
              ]
            }
          },
          {
            id: 'p7-c1-i6',
            text: 'Measure AI Share of Voice \u2014 percentage of prompts where your brand appears vs competitors',
            detail: 'Track what percentage of relevant AI queries cite your brand compared to competitors. AI Share of Voice is emerging as the key metric for measuring AEO success.',
            action: { view: 'competitors', label: 'Open Competitors' },
            doc: {
              title: 'AI Share of Voice Tracking',
              sections: [
                { heading: 'Why This Matters', body: 'AI Share of Voice (SoV) is emerging as the "North Star metric" for AEO — it measures the percentage of relevant AI-generated answers where your brand is mentioned or cited versus competitors. Unlike traditional SEO rankings which show positions, AI SoV shows how often you are the answer. This metric directly correlates with brand visibility in the AI-first search era.' },
                { heading: 'How to Measure', body: 'Define a set of 50-100 queries relevant to your business and industry. Run each query across ChatGPT, Perplexity, Google AI Overviews, and Bing Copilot. Track which queries mention your brand, which mention competitors, and which mention neither. Calculate your SoV as: (queries citing your brand / total queries tested) \u00d7 100. Compare against top 3-5 competitors.' },
                { heading: 'Tools and Automation', body: 'Manual tracking works for initial baselines but does not scale. Consider tools like: HubSpot\'s free AI Share of Voice tool, Otterly.AI, SE Ranking\'s SE Visible, Siftly, or Profound. These automate prompt testing across AI platforms and generate competitive SoV reports. Run measurements monthly for trend tracking.' },
                { heading: 'Action Items', body: '1. Define 50-100 target queries for SoV tracking\n2. Establish a baseline SoV across all major AI platforms\n3. Identify top 3-5 competitors to benchmark against\n4. Set up monthly SoV measurement cadence\n5. Track SoV trends over time (should increase with optimization)\n6. Use SoV data to prioritize content optimization efforts\n7. Report SoV to stakeholders alongside traditional SEO metrics' }
              ]
            }
          },
          {
            id: 'p7-c1-i7',
            text: 'Track sentiment and accuracy of AI-generated brand descriptions',
            detail: 'Monitor whether AI platforms describe your brand positively, negatively, or inaccurately. Negative or wrong AI descriptions can be more damaging than no citation at all.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'AI Sentiment and Accuracy Monitoring',
              sections: [
                { heading: 'Why This Matters', body: 'Being cited by AI engines is only valuable if the citation is accurate and positive. AI platforms can perpetuate outdated information, competitor-favorable comparisons, or outright inaccuracies about your brand. A negative or wrong AI-generated description reaches every user who asks about you — and unlike a bad review, you cannot respond to it directly. Proactive monitoring lets you identify and address issues before they compound.' },
                { heading: 'What to Monitor', body: 'Run branded queries across all major AI platforms monthly. Track: factual accuracy (correct products, pricing, founding date), sentiment (positive, neutral, negative tone), completeness (key differentiators mentioned), comparison framing (how you are positioned vs competitors), and freshness (does it reflect your current offerings). Document every inaccuracy.' },
                { heading: 'How to Fix Issues', body: 'For inaccuracies: trace the error to its likely source (outdated web page, wrong directory listing, competitor content). Fix the source content and update your structured data. For negative sentiment: create content that directly addresses the criticism with evidence. For missing information: publish clear, prominent content about the missing details. AI engines update their knowledge over time as source content changes.' },
                { heading: 'Action Items', body: '1. Run 20+ branded queries across all AI platforms monthly\n2. Categorize each response: accurate/inaccurate, positive/neutral/negative\n3. Document every inaccuracy with its likely source\n4. Fix source content for identified inaccuracies\n5. Create content addressing negative sentiment with evidence\n6. Re-test monthly to verify corrections propagate\n7. Track sentiment trends over time' }
              ]
            }
          },
          {
            id: 'p7-c1-i8',
            text: 'Track AI crawler visits, frequency, and emerging new bot user-agents',
            detail: 'AI companies frequently introduce new crawlers and change user-agent strings. Monitor server logs for new bots and update your access configuration accordingly.',
            action: { view: 'monitoring', label: 'Open Monitoring' },
            doc: {
              title: 'AI Crawler Behavior Monitoring',
              sections: [
                { heading: 'Why This Matters', body: 'The AI crawler landscape changes rapidly. Anthropic merged its "anthropic-ai" and "Claude-Web" user-agents into "ClaudeBot," temporarily giving the new bot unrestricted access to sites that had blocked the old names. OpenAI introduced OAI-SearchBot separately from GPTBot. New AI companies launch crawlers regularly. Without ongoing monitoring, your robots.txt configuration becomes outdated and you may be inadvertently blocking or allowing bots you did not intend to.' },
                { heading: 'What to Track', body: 'Monitor server logs for: known AI bot user-agents and their crawl frequency, new or unrecognized bot user-agents, changes in crawl patterns (sudden increases or drops), which pages each bot prioritizes, response codes returned to bots, and crawl budget consumption. Set up alerts for new user-agent strings that match AI-related patterns.' },
                { heading: 'Staying Current', body: 'Follow AI company announcements for new crawler introductions. Check the robots.txt documentation pages of major AI companies quarterly. Subscribe to SEO industry newsletters that track AI crawler changes. Maintain an internal registry of all known AI bot user-agents and their purposes (training vs search).' },
                { heading: 'Action Items', body: '1. Set up monthly AI bot log analysis\n2. Create an internal registry of known AI crawler user-agents\n3. Configure alerts for new unrecognized bot user-agents\n4. Track crawl frequency trends per bot\n5. Update robots.txt when new bots are identified\n6. Follow AI company announcements for crawler changes\n7. Review and update your bot registry quarterly' }
              ]
            }
          }
        ]
      },
      {
        id: 'p7-continuous',
        name: 'Continuous Improvement',
        items: [
          {
            id: 'p7-c2-i1',
            text: 'A/B test answer formats (paragraph vs list vs table)',
            detail: 'Test different content formats to find what AI engines prefer for your queries.',
            action: { view: 'writer', label: 'Open Content Writer' },
            doc: {
              title: 'A/B Testing Answer Formats',
              sections: [
                { heading: 'Why This Matters', body: 'Different query types favor different content formats. "What is" queries prefer paragraph answers. "How to" queries prefer step lists. "Best X" queries prefer tables. Testing reveals the optimal format for each of your key query types.' },
                { heading: 'How to Test', body: 'Identify queries where you\'re partially cited or not cited. Create alternative format versions of the same content. Deploy one format, test after 2-4 weeks, then try the alternative. Compare citation rates between formats.' },
                { heading: 'Format Options', body: 'Paragraph: Best for definitions and explanations (40-60 words). Ordered list: Best for processes and steps. Unordered list: Best for features and benefits. Table: Best for comparisons and specifications. Combination: Use multiple formats on one page for different sections.' },
                { heading: 'Action Items', body: '1. Identify queries with suboptimal citation rates\n2. Test alternative content formats\n3. Allow 2-4 weeks between format changes\n4. Track citation rates per format\n5. Roll out winning formats across similar content' }
              ]
            }
          },
          {
            id: 'p7-c2-i2',
            text: 'Update content based on AI engine behavior changes',
            detail: 'Continuously adapt content strategy as AI engines evolve their citation behavior.',
            action: { view: 'monitoring', label: 'Open Monitoring' },
            doc: {
              title: 'Adapting to AI Engine Changes',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines update their algorithms, training data, and citation behavior frequently. What works today may not work next month. Staying current with AI engine behavior ensures your AEO strategy remains effective.' },
                { heading: 'How to Stay Current', body: 'Follow AI search industry news (Search Engine Land, Search Engine Journal, Anthropic/OpenAI blogs). Monitor your own citation metrics for sudden changes. Join AEO-focused communities. Test regularly to detect behavioral shifts.' },
                { heading: 'Adaptation Process', body: 'When citation patterns change: identify what changed, analyze which content was affected, test new approaches, update your content strategy, and roll out changes systematically.' },
                { heading: 'Action Items', body: '1. Subscribe to AI search industry publications\n2. Monitor citation metrics weekly for anomalies\n3. Investigate sudden changes in citation behavior\n4. Update content strategy based on findings\n5. Document what works and what doesn\'t for future reference' }
              ]
            }
          },
          {
            id: 'p7-c2-i3',
            text: 'Expand content for new query patterns',
            detail: 'Identify and create content for emerging query patterns in your niche.',
            action: { view: 'content-ops', label: 'Open Content Ops' },
            doc: {
              title: 'Content Expansion for New Queries',
              sections: [
                { heading: 'Why This Matters', body: 'New query patterns emerge constantly as users develop new ways of interacting with AI assistants. Early content creation for emerging queries gives you a first-mover advantage in AI citations before competition intensifies.' },
                { heading: 'Finding New Patterns', body: 'Monitor Google Trends for emerging topics. Check AI platform trending topics. Review your search analytics for new query types. Monitor competitor new content. Watch industry forums for emerging questions.' },
                { heading: 'Content Strategy', body: 'Create content for new queries before they become competitive. Use the AEO best practices from the start: answer-first paragraphs, schema markup, proper heading hierarchy. Update your topic clusters to include new subtopics.' },
                { heading: 'Action Items', body: '1. Set up monitoring for new query patterns\n2. Evaluate emerging queries for business relevance\n3. Create optimized content for high-potential new queries\n4. Add new content to existing topic clusters\n5. Track citation rates for new content' }
              ]
            }
          },
          {
            id: 'p7-c2-i4',
            text: 'Monthly competitor benchmarking',
            detail: 'Compare your AEO performance against competitors every month.',
            action: { view: 'competitors', label: 'Open Competitors' },
            doc: {
              title: 'Monthly Competitor Benchmarking',
              sections: [
                { heading: 'Why This Matters', body: 'AEO is competitive — if a competitor improves their content, they may take citations you previously held. Monthly benchmarking reveals competitive movements and helps you prioritize where to improve or defend your positions.' },
                { heading: 'What to Benchmark', body: 'For your top 50 queries: who gets cited, citation quality, content format used, schema implementation, freshness signals. Compare your overall visibility score against top 3-5 competitors.' },
                { heading: 'Analysis', body: 'Identify queries where competitors are gaining citations. Analyze what they changed. Look for competitors adopting AEO techniques you haven\'t implemented. Find gaps where neither you nor competitors are cited (opportunity).' },
                { heading: 'Action Items', body: '1. Run monthly competitive analysis on top 50 queries\n2. Track competitor citation rates over time\n3. Analyze competitor content improvements\n4. Identify areas where you\'re losing ground\n5. Prioritize content updates to defend/gain positions' }
              ]
            }
          },
          {
            id: 'p7-c2-i5',
            text: 'Report ROI from AEO efforts',
            detail: 'Quantify and report the business impact and return on investment of AEO work.',
            action: { view: 'aeo-impact', label: 'Open AEO Impact' },
            doc: {
              title: 'AEO ROI Reporting',
              sections: [
                { heading: 'Why This Matters', body: 'Demonstrating ROI ensures continued investment in AEO. Without clear reporting on business impact, AEO efforts risk being deprioritized. Quantified results justify the time and resources spent on optimization.' },
                { heading: 'Metrics to Report', body: 'AEO visibility score trend. AI referral traffic and conversions. Revenue attributed to AI-driven visits. Cost savings from automated brand exposure. Brand mention growth. Comparison with traditional SEO metrics.' },
                { heading: 'Report Structure', body: 'Monthly report including: executive summary, visibility score with trend graph, traffic from AI platforms, conversion data, competitive position, optimizations completed, and next month\'s priorities.' },
                { heading: 'Action Items', body: '1. Define AEO KPIs relevant to your business\n2. Set up tracking for all KPIs\n3. Create a monthly reporting template\n4. Present findings to stakeholders\n5. Use data to guide next month\'s priorities' }
              ]
            }
          },
          {
            id: 'p7-c2-i6',
            text: 'Implement quarterly AEO re-optimization cycle',
            detail: 'Schedule quarterly reviews to re-optimize existing content based on AI engine behavior changes and performance data.',
            action: { view: 'checklist', label: 'Review AEO Guide' },
            doc: {
              title: 'Quarterly AEO Re-Optimization',
              sections: [
                { heading: 'Why This Matters', body: 'AI engines evolve their ranking and citation algorithms constantly. Content that earned citations last quarter may lose them as models update. A structured quarterly review ensures your content stays optimized for the current state of AI search, not last quarter\'s version.' },
                { heading: 'Quarterly Review Checklist', body: 'Content freshness: Update statistics, dates, and examples. Schema validation: Re-test all schema on key pages. Heading optimization: Compare your headings against current AI-cited formats. Internal linking: Add links to new content published since last review. Competitor analysis: Check if competitors have overtaken your citations.' },
                { heading: 'What to Re-Optimize', body: 'Priority 1: Pages that lost AI citations since last quarter. Priority 2: Pages with declining organic traffic. Priority 3: Pages with outdated information. Priority 4: Pages where competitors now outrank you in AI results. Priority 5: New topic opportunities identified from AI query monitoring.' },
                { heading: 'Action Items', body: '1. Block 2-3 days quarterly for AEO review\n2. Run citation comparison (this quarter vs last)\n3. Re-optimize top 20 priority pages\n4. Update schema on all modified pages\n5. Document changes and expected impact\n6. Set goals for next quarter' }
              ]
            }
          },
          {
            id: 'p7-c2-i7',
            text: 'Monitor and respond to AI-generated questions about your brand',
            detail: 'Track what questions users ask AI engines about your brand specifically, and ensure your content provides accurate answers.',
            action: { view: 'testing', label: 'Open Testing' },
            doc: {
              title: 'Monitoring AI-Generated Brand Questions',
              sections: [
                { heading: 'Why This Matters', body: 'When users ask AI engines about your brand, the AI generates follow-up questions and explores related subtopics to build its answer. Understanding these AI-driven question chains reveals content gaps you did not know existed and shows you exactly what information AI needs from your site.' },
                { heading: 'Discovery Methods', body: 'Ask ChatGPT/Perplexity about your brand and note every follow-up question they generate. Use "People Also Ask" variations with your brand name. Monitor support tickets for questions users say "AI told me..." about. Track branded queries in Search Console for new question patterns.' },
                { heading: 'Response Strategy', body: 'For each AI-generated question: Does your site have content that answers it? Is that content structured for AI extraction? Is the answer accurate and current? Create dedicated content for questions your site cannot currently answer. Update existing content where AI gives wrong answers about you.' },
                { heading: 'Action Items', body: '1. Run 20 branded queries across AI platforms weekly\n2. Document all AI-generated follow-up questions\n3. Map questions to existing content (or identify gaps)\n4. Create or update content for unanswered questions\n5. Track whether AI answers improve after your updates' }
              ]
            }
          }
        ]
      }
    ]
  }
]
