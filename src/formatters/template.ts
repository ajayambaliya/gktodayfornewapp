export const NEWS_TEMPLATE = `
<!DOCTYPE html>
<html lang="gu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="theme-color" content="#0f0f13">
    <title>{{TITLE_GU}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&family=Noto+Sans+Gujarati:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --ink: #0f0f13;
            --ink-2: #2d2d35;
            --ink-3: #64647a;
            --paper: #faf9f6;
            --paper-2: #f0ede8;
            --accent: #c8410a;
            --accent-warm: #e8a020;
            --chip-bg: rgba(200,65,10,0.15);
            --chip-text: #c8410a;
            --progress: #c8410a;
            --card: #ffffff;
            --shadow-sm: 0 2px 8px rgba(0,0,0,0.05);
            --shadow-md: 0 10px 30px rgba(0,0,0,0.08);
            --shadow-lg: 0 20px 50px rgba(0,0,0,0.12);
            --r: 24px;
            --transition: 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --ink: #f8f9fa;
                --ink-2: #e9ecef;
                --ink-3: #adb5bd;
                --paper: #0a0a0c;
                --paper-2: #16161a;
                --accent: #ff5c26;
                --accent-warm: #ffb84d;
                --chip-bg: rgba(255,92,38,0.2);
                --chip-text: #ffb84d;
                --card: #16161a;
                --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
                --shadow-md: 0 10px 30px rgba(0,0,0,0.4);
                --shadow-lg: 0 20px 50px rgba(0,0,0,0.5);
            }
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Nunito', 'Noto Sans Gujarati', sans-serif;
            background: var(--paper);
            color: var(--ink);
            line-height: 1.8;
            min-height: 100vh;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        #progress-bar {
            position: fixed; top: 0; left: 0; z-index: 200;
            height: 4px; width: 0%;
            background: linear-gradient(90deg, var(--accent), var(--accent-warm));
        }

        /* ── Stunning Hero ── */
        .hero {
            position: relative;
            height: 60vh;
            min-height: 400px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 30px 20px;
            background-color: #000;
            color: #fff;
            overflow: hidden;
        }

        .hero-img {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.7;
        }

        .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, 
                rgba(10,10,12,1) 0%, 
                rgba(10,10,12,0.8) 20%, 
                rgba(10,10,12,0.2) 60%, 
                transparent 100%
            );
            z-index: 1;
        }

        .hero-content {
            position: relative;
            z-index: 2;
            animation: fadeInUp 0.6s ease-out forwards;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .cat-tag {
            display: inline-block;
            background: var(--accent);
            color: #fff;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 0.7rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 12px;
        }

        .hero h1 {
            font-size: clamp(1.8rem, 7vw, 2.8rem);
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 20px;
        }

        .meta-strip {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 0.85rem;
            font-weight: 600;
            color: rgba(255,255,255,0.7);
        }

        /* ── Content Wrapper ── */
        .main-container {
            position: relative;
            z-index: 10;
            margin-top: -25px;
            background: var(--paper);
            border-radius: 24px 24px 0 0;
            padding: 30px 20px 100px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }

        .featured-card {
            background: var(--card);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: var(--shadow-md);
            border: 1px solid rgba(0,0,0,0.05);
            position: relative;
            overflow: hidden;
        }

        .featured-card h3 {
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--accent);
            margin-bottom: 15px;
        }

        .kp-list { list-style: none; }
        .kp-item {
            padding: 10px 0;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            display: flex;
            gap: 12px;
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--ink-2);
        }
        .kp-item:last-child { border-bottom: none; }
        .kp-icon { color: var(--accent); flex-shrink: 0; }

        /* ── Article Body ── */
        .article-content p {
            font-size: 1.15rem;
            margin-bottom: 1.5em;
            color: var(--ink-2);
        }

        .article-content h2 {
            font-size: 1.6rem;
            font-weight: 800;
            margin: 2em 0 0.8em;
            color: var(--ink);
        }

        .article-content ul { margin: 24px 0; list-style: none; }
        .article-content li {
            padding: 8px 0 8px 30px;
            position: relative;
            font-size: 1.1rem;
            color: var(--ink-2);
        }
        .article-content li::before {
            content: '•';
            position: absolute;
            left: 5px; color: var(--accent);
            font-size: 1.4rem;
            line-height: 1;
        }

        .source-footer {
            margin-top: 50px;
            padding: 25px;
            background: var(--paper-2);
            border-radius: 16px;
            text-align: center;
        }

        .source-footer .name {
            font-size: 1.2rem;
            font-weight: 800;
            color: var(--accent);
        }

    </style>
</head>
<body>

<div id="progress-bar"></div>

<section class="hero">
    <img src="{{IMAGE_URL}}" alt="" class="hero-img">
    <div class="hero-overlay"></div>
    <div class="hero-content">
        <div class="cat-tag">{{CATEGORY}}</div>
        <h1>{{TITLE_GU}}</h1>
        <div class="meta-strip">
            <span>By GKToday</span>
            <span>•</span>
            <span id="readTime">3 min વાંચો</span>
        </div>
    </div>
</section>

<main class="main-container">
    <div class="featured-card" id="keyPoints" style="display:none">
        <h3>✨ પરીક્ષા માટે ખાસ મુદ્દા</h3>
        <div class="kp-list" id="keyList"></div>
    </div>

    <div class="article-content" id="articleBody">
        {{BODY_GU}}
    </div>

    <div class="source-footer">
        <div class="name">Source :- GKToday</div>
    </div>
</main>

<script>
    window.addEventListener('scroll', () => {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        document.getElementById('progress-bar').style.width = pct + '%';
    }, { passive: true });

    (function() {
        const body = document.getElementById('articleBody');
        const ul = body?.querySelector('ul');
        if (!ul) return;
        const items = Array.from(ul.querySelectorAll('li')).slice(0, 5);
        if (items.length < 2) return;
        const kl = document.getElementById('keyList');
        items.forEach(li => {
            const div = document.createElement('div');
            div.className = 'kp-item';
            div.innerHTML = '<span class="kp-icon">✦</span>' + '<span>' + li.textContent.trim() + '</span>';
            kl.appendChild(div);
        });
        document.getElementById('keyPoints').style.display = 'block';
    })();
</script>

</body>
</html>
`;

export interface TemplateData {
  title_gu: string;
  category: string;
  url: string;
  body_gu: string;
  image_url: string;
}

export function applyNewsTemplate(data: TemplateData): string {
  // Strip all hyperlinks robustly
  const cleanBody = data.body_gu.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gim, '$1');
  
  // Use provided image or fallback
  const imageUrl = data.image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1000';

  return NEWS_TEMPLATE
    .replace(/{{TITLE_GU}}/g, data.title_gu)
    .replace(/{{CATEGORY}}/g, data.category)
    .replace(/{{URL}}/g, data.url)
    .replace(/{{IMAGE_URL}}/g, imageUrl)
    .replace(/{{BODY_GU}}/g, cleanBody);
}
