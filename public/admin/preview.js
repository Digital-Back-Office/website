/* Decap CMS preview templates.
 * Plain, build-step-free JS using the globals the decap-cms.js bundle
 * exposes: createClass (React.createClass-style components) and h
 * (hyperscript element creator). No JSX, no bundler.
 */

/* ---------------------------------------------------------------------
 * Shared helpers
 * ------------------------------------------------------------------- */

// Reads entry.data[path...] without throwing on missing intermediate keys.
// Decap entries are Immutable Maps, so this walks via getIn and falls
// back to a plain default rather than crashing a template mid-render.
function field(entry, path, fallback) {
  try {
    var value = entry.getIn(['data'].concat(path));
    if (value === undefined || value === null) return fallback;
    // Immutable List/Map -> plain JS for easy .map()/iteration below.
    if (value && typeof value.toJS === 'function') return value.toJS();
    return value;
  } catch (e) {
    return fallback;
  }
}

function list(entry, path) {
  var value = field(entry, path, []);
  return Array.isArray(value) ? value : [];
}

// Dependency-free MDX-body -> HTML for the blog preview. Mirrors what the
// real pipeline (remark + the <Quote>/<Faq> components) produces for the
// constructs this repo's posts actually use: headings, paragraphs (soft
// line breaks merge into one <p>), tight/loose bullet and numbered lists
// with indented continuation lines, bold/italic/code/links, <hr>, standalone
// <img>, <Quote quote={...}/> and <Faq items={...}/>. Nothing is eval'd.

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function safeHref(url) {
  var u = String(url).trim();
  if (/^\s*javascript:/i.test(u)) return '#';
  return u.replace(/"/g, '%22');
}

// Astro's markdown pipeline runs smartypants on prose: curly quotes,
// ellipses and dashes. Applied only to text nodes - never inside tags
// (attributes/URLs) or <code>.
function smartPunctuation(html) {
  var parts = html.split(/(<[^>]*>)/);
  var prev = ' ';
  var inCode = false;
  var openers = ' \t\n([{–—';
  return parts.map(function (part) {
    if (part.charAt(0) === '<' && part.charAt(part.length - 1) === '>') {
      if (/^<code\b/i.test(part)) inCode = true;
      else if (/^<\/code>/i.test(part)) inCode = false;
      prev = part.charAt(1) === '/' ? 'x' : ' ';
      return part;
    }
    if (inCode || !part) {
      if (part) prev = part.charAt(part.length - 1);
      return part;
    }
    var text = part.replace(/\.\.\./g, '…').replace(/---/g, '—').replace(/--/g, '–');
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var before = i === 0 ? prev : text.charAt(i - 1);
      var isOpening = openers.indexOf(before) !== -1;
      if (ch === '"') out += isOpening ? '“' : '”';
      else if (ch === "'") out += isOpening ? '‘' : '’';
      else out += ch;
    }
    prev = text.charAt(text.length - 1);
    return out;
  }).join('');
}

// Trailing two spaces (or a backslash) is a markdown hard line break; keep a
// marker through the trimming below and turn it into <br> in inlineMarkdown.
function hardBreakMark(rawLine) {
  var text = String(rawLine);
  return /(?: {2,}|\\)$/.test(text) ? text.trim().replace(/\\$/, '') + '\u0001' : text.trim();
}

function inlineMarkdown(text) {
  return smartPunctuation(String(text).replace(/\u0001\s*$/, '')
    .split(/(`[^`\n]+`)/)
    .map(function (part, idx) {
      if (idx % 2 === 1) return '<code>' + escapeHtml(part.slice(1, -1)) + '</code>';
      return escapeHtml(part)
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
          return '<a href="' + safeHref(url) + '">' + label + '</a>';
        })
        .replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
    })
    .join('')).replace(/\u0001\n?/g, '<br>\n');
}

// Faq.astro's renderInlineMarkdown: escape, then links, then bold only.
function faqInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, url) {
      return '<a href="' + safeHref(url) + '">' + label + '</a>';
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function parseStringLiteral(raw) {
  var s = String(raw).trim();
  var q = s.charAt(0);
  if (q !== '`' && q !== '"' && q !== "'") return s;
  s = s.slice(1, -1);
  if (q === '`') return s.replace(/\\`/g, '`');
  return s.replace(/\\(["'\\])/g, '$1').replace(/\\n/g, '\n');
}

function exportStatementComplete(statement) {
  var eq = statement.indexOf('=');
  if (eq === -1) return false;
  var rhs = statement.slice(eq + 1);
  var depth = 0;
  var str = null;
  for (var i = 0; i < rhs.length; i++) {
    var ch = rhs.charAt(i);
    if (str) {
      if (ch === '\\') i++;
      else if (ch === str) str = null;
    } else if (ch === '"' || ch === "'" || ch === '`') str = ch;
    else if (ch === '[' || ch === '{' || ch === '(') depth++;
    else if (ch === ']' || ch === '}' || ch === ')') depth--;
  }
  return !str && depth <= 0 && rhs.trim() !== '';
}

// Removes MDX import/export statements (including multi-line ones such as
// `export const faqs = [ ... ];`) and returns the exported raw values.
function splitMdxModule(src) {
  var lines = String(src).replace(/\r\n/g, '\n').split('\n');
  var body = [];
  var exportsMap = {};
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (/^\s*import\s/.test(line)) continue;
    var m = line.match(/^export\s+(?:const|let|var)\s+(\w+)\s*=/);
    if (m) {
      var statement = line;
      while (!exportStatementComplete(statement) && i + 1 < lines.length) {
        i++;
        statement += '\n' + lines[i];
      }
      exportsMap[m[1]] = statement
        .replace(/^export\s+(?:const|let|var)\s+\w+\s*=\s*/, '')
        .replace(/;\s*$/, '');
      continue;
    }
    body.push(line);
  }
  return { body: body.join('\n'), exportsMap: exportsMap };
}

function parseFaqItems(raw) {
  var items = [];
  var lit = '("(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`[^`]*`)';
  var re = new RegExp('\\bq\\s*:\\s*' + lit + '\\s*,\\s*a\\s*:\\s*' + lit, 'g');
  var m;
  while ((m = re.exec(raw || ''))) {
    items.push({ q: parseStringLiteral(m[1]), a: parseStringLiteral(m[2]) });
  }
  return items;
}

function renderQuoteCard(text) {
  return '<div class="card border-0 bg-secondary " style="margin: 3rem auto">' +
    '<div class="card-body"><figure><blockquote class="blockquote"><p>' +
    escapeHtml(text) + '</p></blockquote></figure></div></div>';
}

function renderFaqBlock(items) {
  return '<div class="blog-faq">' + items.map(function (it) {
    return '<details><summary>' + escapeHtml(it.q) + '</summary><p>' + faqInlineMarkdown(it.a) + '</p></details>';
  }).join('') + '</div>';
}

var BULLET_RE = /^ {0,3}([-*+])\s+(.*)$/;
var ORDERED_RE = /^ {0,3}(\d+)[.)]\s+(.*)$/;

function markdownToHtml(src) {
  if (!src) return '';
  var mod = splitMdxModule(src);
  var lines = mod.body.split('\n');
  var exportsMap = mod.exportsMap;
  var html = [];
  var para = [];
  var i = 0;

  function flushPara() {
    if (para.length) {
      html.push('<p>' + inlineMarkdown(para.join('\n')) + '</p>');
      para = [];
    }
  }

  function startsBlock(line) {
    var t = line.trim();
    return /^#{1,6}\s/.test(t) || /^<(?:[A-Z]|img\b)/i.test(t) || /^(-{3,}|\*{3,}|_{3,})$/.test(t);
  }

  while (i < lines.length) {
    var line = lines[i];
    var trimmed = line.trim();

    if (trimmed === '') { flushPara(); i++; continue; }

    if (/^<Quote\b/.test(trimmed)) {
      flushPara();
      var qa = trimmed.match(/quote=\{(\w+)\}/);
      var qs = trimmed.match(/quote=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/);
      var quoteText = qa ? parseStringLiteral(exportsMap[qa[1]] || '') : (qs ? parseStringLiteral(qs[1]) : '');
      html.push(renderQuoteCard(quoteText));
      i++; continue;
    }
    if (/^<Faq\b/.test(trimmed)) {
      flushPara();
      var fa = trimmed.match(/items=\{(\w+)\}/);
      html.push(renderFaqBlock(parseFaqItems(fa ? exportsMap[fa[1]] : '')));
      i++; continue;
    }
    if (/^<img\s[^<>]*>$/i.test(trimmed)) {
      flushPara();
      html.push(trimmed.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, ''));
      i++; continue;
    }
    if (/^<[A-Z]/.test(trimmed)) { flushPara(); i++; continue; }

    var heading = trimmed.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      flushPara();
      html.push('<h' + heading[1].length + '>' + inlineMarkdown(heading[2]) + '</h' + heading[1].length + '>');
      i++; continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) { flushPara(); html.push('<hr>'); i++; continue; }

    var first = line.match(BULLET_RE) || line.match(ORDERED_RE);
    if (first) {
      flushPara();
      var ordered = !BULLET_RE.test(line);
      var markerRe = ordered ? ORDERED_RE : BULLET_RE;
      var startNum = ordered ? parseInt(first[1], 10) : 1;
      var items = [];
      var loose = false;

      while (i < lines.length) {
        var mk = lines[i].match(markerRe);
        if (!mk) break;
        var item = [hardBreakMark(mk[2])];
        i++;
        while (i < lines.length && lines[i].trim() !== '' && !markerRe.test(lines[i]) &&
               !BULLET_RE.test(lines[i]) && !ORDERED_RE.test(lines[i]) && !startsBlock(lines[i])) {
          item.push(hardBreakMark(lines[i]));
          i++;
        }
        var j = i;
        while (j < lines.length && lines[j].trim() === '') j++;
        var extraParas = [];
        while (j > i && j < lines.length && /^( {2,}|\t)\S/.test(lines[j]) && !markerRe.test(lines[j])) {
          var para2 = [];
          while (j < lines.length && lines[j].trim() !== '' && !markerRe.test(lines[j])) { para2.push(hardBreakMark(lines[j])); j++; }
          extraParas.push(para2);
          loose = true;
          i = j;
          while (j < lines.length && lines[j].trim() === '') j++;
        }
        items.push({ lead: item, extra: extraParas });
        if (j < lines.length && markerRe.test(lines[j])) {
          if (j > i) loose = true;
          i = j;
          continue;
        }
        break;
      }

      var tag = ordered ? 'ol' : 'ul';
      var open = '<' + tag + (ordered && startNum !== 1 ? ' start="' + startNum + '"' : '') + '>';
      html.push(open + items.map(function (it) {
        var parts = [it.lead.join('\n')].concat(it.extra.map(function (p) { return p.join('\n'); }));
        if (loose) return '<li>' + parts.map(function (p) { return '<p>' + inlineMarkdown(p) + '</p>'; }).join('') + '</li>';
        return '<li>' + inlineMarkdown(parts[0]) + '</li>';
      }).join('') + '</' + tag + '>');
      continue;
    }

    para.push(hardBreakMark(line));
    i++;
  }
  flushPara();
  return html.join('\n');
}

/* ---------------------------------------------------------------------
 * Preview styles - lifted from the built site so the iframe looks like
 * the real page: Bootstrap-based theme, icon font, then the project's
 * own design tokens/global rules (public/admin/preview.css is a
 * concatenation of src/styles/tokens.css + global.css + container.css,
 * plus a scroll-safety override - see that file's trailing comment).
 * ------------------------------------------------------------------- */
CMS.registerPreviewStyle('/assets/css/theme.min.css');
CMS.registerPreviewStyle('/assets/icons/around-icons.min.css');
CMS.registerPreviewStyle('/admin/preview.css');

/* ---------------------------------------------------------------------
 * Blog posts (src/pages/posts/*.mdx) - rendered by src/layouts/BlogLayout.astro.
 * The template reproduces BlogLayout's real markup/classes: title, "By:"
 * byline, lead description, #content body, tags, author widget with share
 * icons, the comments mount point and the sticky "Book a Discovery Call"
 * sidebar (static facsimile of ConsultationForm.astro's front face - its
 * flatpickr/booking script is not run). Like the real layout it does NOT
 * show the frontmatter `image` (that only feeds og:image); the post's own
 * inline <img> is what appears. The Navbar/Footer from Layout.astro are
 * not reproduced. The body goes through markdownToHtml above, which also
 * resolves <Quote quote={quote}/> and <Faq items={faqs}/> from the post's
 * `export const` lines. Author name/description/image come from the
 * relation widget's fieldsMetaData (searched by slug, since its nesting
 * depends on the Decap version); if absent the slug is shown instead.
 * ------------------------------------------------------------------- */
function assetUrl(getAsset, path) {
  if (!path) return '';
  try {
    var resolved = getAsset ? getAsset(path) : null;
    var url = resolved ? String(resolved) : '';
    return url && url !== '[object Object]' ? url : path;
  } catch (e) {
    return path;
  }
}

function findMetaByKey(node, key, depth) {
  if (!node || typeof node !== 'object' || depth > 4) return null;
  if (Object.prototype.hasOwnProperty.call(node, key) && node[key] && typeof node[key] === 'object') return node[key];
  var keys = Object.keys(node);
  for (var i = 0; i < keys.length; i++) {
    var found = findMetaByKey(node[keys[i]], key, depth + 1);
    if (found) return found;
  }
  return null;
}

function renderBlogConsultationForm() {
  function inputGroup(label, props) {
    return h('div', { className: 'mb-2' },
      h('label', { className: 'form-label fs-base', htmlFor: props.id }, ' ' + label),
      h('input', Object.assign({ className: 'form-control form-control-lg fs-sm', readOnly: true }, props))
    );
  }
  return h('div', { className: 'flip-card' },
    h('div', { className: 'flip-card-inner' },
      h('div', { className: 'flip-card-front' },
        h('form', { className: 'card-body', style: { backgroundColor: 'var(--bg-contrast)' }, onSubmit: function (e) { e.preventDefault(); } },
          h('h2', { className: 'h3 card-title  text-center pb-2 pb-xxl-3' }, 'Book a Discovery Call'),
          inputGroup('Your Name', { type: 'text', placeholder: 'Enter your name', id: 'preview-name' }),
          inputGroup('Company Name', { type: 'text', placeholder: "Enter your company's name", id: 'preview-company' }),
          inputGroup('Email address', { type: 'email', placeholder: 'Enter your email address', id: 'preview-email' }),
          h('div', { className: 'mb-2' },
            h('label', { className: 'form-label', htmlFor: 'preview-date' }, 'Date'),
            h('div', { className: 'position-relative' },
              h('input', { className: 'form-control form-control-lg date-picker pe-5 fs-sm', type: 'text', placeholder: 'Choose available date', id: 'preview-date', readOnly: true }),
              h('i', { className: 'ai-calendar position-absolute top-50 end-0 translate-middle-y fs-lg  opacity-80 me-3' })
            )
          ),
          h('div', { className: 'mb-2' },
            h('label', { className: 'form-label', htmlFor: 'preview-time' }, 'Time'),
            h('div', { className: 'position-relative' },
              h('select', { className: 'form-control form-control-lg pe-5 fs-sm', id: 'preview-time', defaultValue: '' },
                h('option', { value: '' }, 'Choose date first')
              )
            )
          ),
          h('div', { className: 'd-flex flex-column flex-sm-row flex-lg-column flex-xxl-row align-items-center justify-content-center justify-content-lg-start pt-3 pt-xxl-4' },
            h('button', { className: 'btn btn-lg btn-outline-primary book-btn w-100 h-100 py book-now-btn', type: 'submit', disabled: true }, 'Book now')
          )
        )
      )
    )
  );
}

var BlogPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var getAsset = this.props.getAsset;
    var title = field(entry, ['title'], 'Untitled post');
    var description = field(entry, ['description'], '');
    var tags = list(entry, ['tags']);
    var authorSlug = field(entry, ['author'], '');
    var bodyHtml = markdownToHtml(field(entry, ['body'], ''));

    var authorData = {};
    try {
      var meta = this.props.fieldsMetaData;
      var plainMeta = meta && typeof meta.toJS === 'function' ? meta.toJS() : meta;
      var scope = plainMeta && plainMeta.author ? plainMeta.author : plainMeta;
      authorData = findMetaByKey(scope, authorSlug, 0) || {};
    } catch (e) {
      authorData = {};
    }
    var authorName = authorData.name || authorSlug || 'Digital Back Office';
    var authorImage = assetUrl(getAsset, authorData.image);

    var shareLinks = [
      { icon: 'ai-linkedin', label: 'LinkedIn', cls: 'nav-link p-2 me-2 ' },
      { icon: 'ai-facebook', label: 'Facebook', cls: 'nav-link p-2 me-2 ' },
      { icon: 'ai-telegram fs-sm', label: 'Telegram', cls: 'nav-link p-2 me-2 ' },
      { icon: 'ai-x', label: 'X', cls: 'nav-link p-2 ' },
    ];

    return h('div', { className: 'blog-preview' },
      h('section', { className: 'container pt-5 mt-5' },
        h('div', { className: 'row justify-content-between' },
          h('div', { className: 'col-lg-8 col-xl-8 pe-lg-4 pe-xl-0 pb-5' },
            h('h1', { className: 'h2 pb-2 pb-lg-3' }, title),
            h('div', { className: 'd-flex flex-wrap align-items-center justify-content-between border-bottom mb-4 ' },
              h('div', { className: 'd-flex align-items-center mb-4 me-4' },
                h('span', { className: 'fs-sm me-2' }, 'By:'),
                h('a', { className: 'nav-link position-relative fw-semibold p-0 blog-layout-a', href: '#author' },
                  authorName,
                  h('span', { className: 'd-block position-absolute start-0 bottom-0 w-100', style: { backgroundColor: 'currentColor', height: '1px' } })
                )
              )
            ),
            h('p', { className: 'lead pt-2 pt-sm-3' }, description),
            h('div', { id: 'content', dangerouslySetInnerHTML: { __html: bodyHtml } }),
            h('div', { className: 'd-flex flex-wrap pb-5 pt-3 pt-md-4 pt-xl-5 mt-xl-n2' },
              h('h3', { className: 'h6 py-1 mb-0 me-4' }, 'Relevant tags:'),
              tags.map(function (tag, i) {
                return h('span', { key: i, className: 'nav-link fs-sm fw-bold py-1 px-0 me-3' }, h('span', {}, '#'), tag);
              })
            ),
            h('div', { className: 'border-top border-bottom py-4', id: 'author' },
              h('div', { className: 'd-flex align-items-start py-2' },
                authorImage ? h('img', { className: 'd-block rounded-circle mb-3', src: authorImage, width: 56, height: 56, alt: 'Author image' }) : null,
                h('div', { className: 'd-md-flex w-100 ps-4' },
                  h('div', { style: { maxWidth: '26rem' } },
                    h('h3', { className: 'h5 mb-2' }, authorName),
                    h('p', { className: 'fs-sm mb-0' }, authorData.description || '')
                  ),
                  h('div', { className: 'pt-4 pt-md-0 ps-md-4 ms-md-auto ' },
                    h('h3', { className: 'h5 ' }, 'Share post:'),
                    h('div', { className: 'd-flex' },
                      shareLinks.map(function (link) {
                        return h('a', { key: link.label, className: link.cls, href: '#', title: link.label, 'aria-label': link.label, onClick: function (e) { e.preventDefault(); } },
                          h('i', { className: link.icon })
                        );
                      })
                    )
                  )
                )
              )
            ),
            h('div', { className: 'giscus pt-5 pb-4 border-bottom', id: 'comments' })
          ),
          h('aside', { className: 'col-lg-3 col-xl-3 offset-xl-1' },
            h('div', { className: 'offcanvas-lg offcanvas-end', id: 'sidebar', style: { height: '100%' } },
              h('div', { className: 'offcanvas-header' },
                h('h4', { className: 'offcanvas-title' }, 'Sidebar'),
                h('button', { className: 'btn-close ms-auto', type: 'button', 'aria-label': 'Close' })
              ),
              h('div', { className: 'offcanvas-body', style: { height: '100%', paddingBottom: '1rem' } },
                h('div', { className: 'offcanvas-body', style: { height: '100%' } },
                  h('div', { className: 'col contact-div offset-xxl-1 pt-sm-3 sticky-top', style: { marginRight: '-50px', zIndex: 1, top: '6rem' } },
                    h('div', { id: 'sticky-component', className: 'card contact-form border-0' }, renderBlogConsultationForm())
                  )
                )
              )
            )
          )
        )
      )
    );
  },
});

CMS.registerPreviewTemplate('blog', BlogPreview);

/* ---------------------------------------------------------------------
 * Authors (src/content/authors/*.md) - fields: name, description, image.
 * This collection has no standalone page/component of its own (grepped
 * for getEntry("authors"/getCollection("authors") across src/ - the only
 * hit is BlogLayout.astro's getEntry("authors", frontmatter.author) call,
 * which renders the author via the "author box" markup already copied
 * into BlogPreview above). So the preview reuses that exact author-box
 * markup rather than inventing new layout for data that is never shown
 * on its own page.
 * ------------------------------------------------------------------- */
var AuthorPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var name = field(entry, ['name'], 'Untitled author');
    var description = field(entry, ['description'], '');
    var image = field(entry, ['image'], '');
    var imageUrl = image && this.props.getAsset ? this.props.getAsset(image) : image;

    return h('div', { className: 'container pt-5 mt-5' },
      h('div', { className: 'border-top border-bottom py-4' },
        h('div', { className: 'd-flex align-items-start py-2' },
          imageUrl ? h('img', {
            className: 'd-block rounded-circle mb-3',
            src: imageUrl,
            width: 56,
            height: 56,
            alt: 'Author image',
            style: { marginRight: '1rem' },
          }) : null,
          h('div', {},
            h('h3', { className: 'h5 mb-2' }, name),
            h('p', { className: 'fs-sm mb-0' }, description)
          )
        )
      )
    );
  },
});

CMS.registerPreviewTemplate('authors', AuthorPreview);

/* ---------------------------------------------------------------------
 * Industries (src/content/industries/*.md) - rendered by
 * src/pages/industry/[slug].astro. Fields per public/admin/config.yml
 * collection "industries": title, description, hero{heading,subtext,
 * video,cta_text,cta_link}, trust{line}, barriers{heading,cards[]},
 * products{title,subtitle,tabs[]{id,name,heading,sections[],cta_text,
 * cta_link,image,image_alt}}, why_trust{heading,cards[]{title,
 * description,icon}}. The real page renders tabs behind Bootstrap JS
 * tab-switching and resolves `icon` to one of five inline SVGs - the
 * preview can't run that JS, so it stacks every tab's content instead
 * of hiding all but the active one, and shows the icon's name as a
 * small badge rather than redrawing each SVG by hand.
 * ------------------------------------------------------------------- */
var IndustryPreview = createClass({
  render: function (_) {
    var entry = this.props.entry;
    var hero = field(entry, ['hero'], {});
    var trust = field(entry, ['trust'], {});
    var barriers = field(entry, ['barriers'], {});
    var products = field(entry, ['products'], {});
    var whyTrust = field(entry, ['why_trust'], {});
    var barrierCards = list(entry, ['barriers', 'cards']);
    var tabs = list(entry, ['products', 'tabs']);
    var trustCards = list(entry, ['why_trust', 'cards']);

    return h('main', { className: 'industry-page-wrapper' },
      h('section', { className: 'hero-section' },
        h('div', { className: 'container' },
          h('div', { className: 'row align-items-center' },
            h('div', { className: 'col-lg-6 hero-text-col mb-5 mb-lg-0' },
              h('h1', { className: 'hero-heading' }, hero.heading),
              h('p', { className: 'hero-subtext' }, hero.subtext),
              hero.cta_text ? h('a', { className: 'hero-cta-btn', href: hero.cta_link || '/contact-us/' }, hero.cta_text) : null
            )
          )
        )
      ),
      trust.line ? h('section', { className: 'trust-section' },
        h('div', { className: 'container' },
          h('div', { className: 'trust-box' },
            h('p', { className: 'trust-line', dangerouslySetInnerHTML: { __html: trust.line } })
          )
        )
      ) : null,
      barrierCards.length ? h('section', { className: 'barriers-section' },
        h('div', { className: 'container' },
          h('h2', { className: 'barriers-heading' }, barriers.heading),
          h('div', { className: 'barriers-grid' },
            barrierCards.map(function (card, i) {
              var cleanTitle = (card.title || '').replace(/^\d+[.\s-]+/, '');
              return h('div', { className: 'barrier-card', key: i },
                h('div', { className: 'barrier-card-badge' }, h('span', {}, '0' + (i + 1))),
                h('h3', { className: 'barrier-title' }, cleanTitle),
                h('p', { className: 'barrier-text' }, card.description)
              );
            })
          )
        )
      ) : null,
      tabs.length ? h('section', { className: 'products-section' },
        h('div', { className: 'container' },
          h('div', { className: 'section-header text-center' },
            h('h2', { className: 'products-title' }, products.title),
            h('p', { className: 'products-subtitle' }, products.subtitle)
          ),
          tabs.map(function (tab, i) {
            return h('div', { className: 'tab-content-box', key: i, style: { marginBottom: '2rem' } },
              h('h3', { className: 'tab-content-heading' }, tab.name + ' - ' + tab.heading),
              (tab.sections || []).map(function (section, j) {
                return h('div', { className: 'tab-section-item', key: j },
                  h('h4', { className: 'tab-section-subheading' }, section.subheading),
                  h('p', { className: 'tab-section-text' }, section.description)
                );
              }),
              tab.image ? h('img', { className: 'product-showcase-image', src: this.props.getAsset ? this.props.getAsset(tab.image) : tab.image, alt: tab.image_alt || tab.name }) : null
            );
          }, this)
        )
      ) : null,
      trustCards.length ? h('section', { className: 'why-trust-section' },
        h('div', { className: 'container' },
          h('h2', { className: 'why-trust-heading', dangerouslySetInnerHTML: { __html: whyTrust.heading || '' } }),
          h('div', { className: 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center' },
            trustCards.map(function (card, i) {
              return h('div', { className: 'col', key: i },
                h('div', { className: 'trust-card' },
                  h('span', { className: 'trust-card-icon-label fs-xs' }, '[' + card.icon + ']'),
                  h('h3', { className: 'trust-card-title' }, card.title),
                  h('p', { className: 'trust-card-text' }, card.description)
                )
              );
            })
          )
        )
      ) : null
    );
  },
});

CMS.registerPreviewTemplate('industries', IndustryPreview);

/* ---------------------------------------------------------------------
 * Home page (src/content/home/home.md), rendered by src/pages/index.astro
 * via src/components/home/*.astro. Covers only the sections that page
 * actually imports: Hero, Partners, AISolutions, RoadMap, Features,
 * TechAndTestimonials (testimonials half only - the commented-out
 * tech-logos slider in that component is dead markup, skipped here too).
 * Two config fields are NOT rendered below because they are not wired
 * into any live page:
 *   - `about`: src/components/home/About.astro reads home.about and has
 *     real markup, but index.astro never imports About - grepped for
 *     "About.astro" across src/ and the only hit is the component's own
 *     file. Component exists, unused.
 *   - `keyPoints`: no component anywhere reads this field at all (grepped
 *     "keyPoints" across src/ - only hits are config.ts and the content
 *     file itself). No renderer exists for it, period.
 * Decorative, non-data-driven markup (the animated dashboard mockup in
 * Hero, per-card SVG icons keyed off array index in AISolutions/RoadMap/
 * Features) is skipped - it never comes from CMS fields, so redrawing it
 * wouldn't make the preview any more faithful to what an editor changed.
 * ------------------------------------------------------------------- */
var HomePreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var hero = field(entry, ['hero'], {});
    var partnersImages = list(entry, ['partners', 'images']);
    var aiSolutions = field(entry, ['ai_solutions'], {});
    var aiCards = list(entry, ['ai_solutions', 'cards']);
    var roadmap = field(entry, ['roadmap'], {});
    var roadmapCards = list(entry, ['roadmap', 'cards']);
    var features = field(entry, ['features'], {});
    var featureCards = list(entry, ['features', 'cards']);
    var testimonials = list(entry, ['testimonials']);
    var getAsset = this.props.getAsset || function (p) { return p; };

    return h('div', {},
      h('section', { className: 'hero-section' },
        h('div', { className: 'container' },
          h('span', { className: 'ai-badge' }, hero.pill_text),
          h('h1', { className: 'hero-title' }, (hero.title_part_1 || '') + ' ' + (hero.title_part_2 || '')),
          h('p', { className: 'hero-description' }, hero.info)
        )
      ),
      h('section', { className: 'partners' },
        h('div', { className: 'container' },
          h('div', { className: 'partners-grid' },
            partnersImages.map(function (img, i) {
              return h('img', { key: i, className: 'partner-logo', src: getAsset(img.src), alt: img.name });
            })
          )
        )
      ),
      h('section', { className: 'ai-solutions-section' },
        h('div', { className: 'container' },
          h('h2', { className: 'solutions-title' }, aiSolutions.title),
          h('p', { className: 'solutions-subtitle' }, aiSolutions.sub_title),
          h('div', { className: 'row g-4 solutions-grid' },
            aiCards.map(function (card, i) {
              return h('div', { className: 'col-lg-3 col-md-6', key: i },
                h('div', { className: 'solution-card' },
                  h('div', { className: 'card-inner' },
                    h('span', { className: 'card-index' }, String(i + 1).padStart(2, '0')),
                    h('h3', { className: 'card-heading' }, card.heading),
                    h('p', { className: 'card-desc' }, card.description)
                  )
                )
              );
            })
          ),
          h('div', { className: 'cta-wrapper' }, h('span', { className: 'btn primary-button' }, aiSolutions.cta_text))
        )
      ),
      h('section', { className: 'roadmap' },
        h('div', { className: 'container' },
          h('h2', { className: 'roadmap-title' }, (roadmap.title_1 || '') + ' ' + (roadmap.title_2 || '')),
          h('p', { className: 'roadmap-subtitle' }, roadmap.sub_title),
          roadmapCards.map(function (card, i) {
            return h('div', { className: 'roadmap-card', key: i },
              h('span', { className: 'node-num' }, '0' + (i + 1)),
              h('h3', {}, card.heading),
              h('p', {}, card.description)
            );
          })
        )
      ),
      h('section', { className: 'features' },
        h('div', { className: 'container' },
          h('h2', { className: 'features-title' }, features.title),
          h('div', { className: 'bento-grid' },
            featureCards.map(function (card, i) {
              return h('div', { className: 'bento-card', key: i },
                h('h3', { className: 'card-title-text' }, card.title),
                h('p', { className: 'card-desc-text' }, card.info)
              );
            })
          )
        )
      ),
      h('section', { className: 'tech' },
        h('div', { className: 'container testimonials-section' },
          h('h2', { className: 'solutions-title' }, 'What Our Clients Say'),
          testimonials.map(function (t, i) {
            return h('div', { className: 'swiper-slide', key: i, style: { marginBottom: '1.5rem' } },
              h('h3', { className: 'testimonial-title' }, t.title),
              h('p', { className: 'testimonial-text' }, t.desc),
              h('div', { className: 'testimonial-author' },
                h('h4', { className: 'testimonial-name' }, t.name),
                h('p', { className: 'testimonial-role' }, t.designation)
              )
            );
          })
        )
      )
    );
  },
});

CMS.registerPreviewTemplate('home', HomePreview);

/* ---------------------------------------------------------------------
 * About page (src/content/about/about.md), rendered by src/pages/about-us.astro
 * via src/components/about-us/{Hero,Mission,Values,Benefit,Approach}.astro.
 * Decorative, non-data SVG diagrams in Mission/Approach are skipped - they
 * are hand-drawn and don't read from any entry field. Two sub-fields,
 * mission.img and approach.img, are declared in the schema/config but
 * never read by Mission.astro/Approach.astro (grepped both files for
 * ".img" - no match); they are rendered here anyway as a plain thumbnail
 * so an editor can at least see what they uploaded, with that caveat.
 * ------------------------------------------------------------------- */
var AboutPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var hero = field(entry, ['hero'], {});
    var heroFeatures = list(entry, ['hero', 'features']);
    var mission = field(entry, ['mission'], {});
    var values = field(entry, ['values'], {});
    var valueCards = list(entry, ['values', 'cards']);
    var benefits = field(entry, ['benefits'], {});
    var benefitPoints = list(entry, ['benefits', 'points']);
    var approach = field(entry, ['approach'], {});
    var getAsset = this.props.getAsset || function (p) { return p; };

    return h('div', {},
      h('section', { className: 'hero-section' },
        h('div', { className: 'container' },
          h('h1', {}, hero.title),
          h('ul', { className: 'list-unstyled d-flex flex-wrap mb-0' },
            heroFeatures.map(function (f, i) { return h('li', { key: i, className: 'me-4' }, f); })
          )
        )
      ),
      h('section', { className: 'mission' },
        h('div', { className: 'container' },
          mission.img ? h('img', { src: getAsset(mission.img), alt: mission.title, style: { maxWidth: '200px', display: 'block', marginBottom: '1rem' } }) : null,
          h('h2', {}, mission.title),
          h('p', { className: 'opacity-70' }, mission.desc)
        )
      ),
      h('section', { className: 'values' },
        h('div', { className: 'container' },
          h('h2', {}, values.title),
          h('div', { className: 'row' },
            valueCards.map(function (card, i) {
              return h('div', { className: 'col-md-4 mb-3', key: i },
                h('div', { className: 'card border-0 bg-secondary rounded-5 h-100' },
                  h('div', { className: 'card-body' },
                    card.svg ? h('img', { src: getAsset(card.svg), alt: card.alt, className: 'mb-3', style: { width: '32px' } }) : null,
                    h('h3', { className: 'h4' }, card.title),
                    h('p', { className: 'opacity-70' }, card.desc)
                  )
                )
              );
            })
          )
        )
      ),
      h('section', { className: 'benefit' },
        h('div', { className: 'container' },
          h('h2', {}, benefits.title),
          benefitPoints.map(function (point, i) {
            return h('div', { className: 'd-flex pb-3 mb-2', key: i },
              h('div', { className: 'text-body-secondary pt-1' }, point.number),
              h('div', { className: 'ps-3' },
                h('h3', { className: 'h5' }, point.title),
                h('p', { className: 'opacity-70 mb-0' }, point.desc)
              )
            );
          })
        )
      ),
      h('section', { className: 'approach' },
        h('div', { className: 'container' },
          approach.img ? h('img', { src: getAsset(approach.img), alt: approach.title, style: { maxWidth: '200px', display: 'block', marginBottom: '1rem' } }) : null,
          h('h2', {}, approach.title),
          h('p', { className: 'opacity-70' }, approach.desc)
        )
      )
    );
  },
});

CMS.registerPreviewTemplate('about', AboutPreview);

/* ---------------------------------------------------------------------
 * Events page copy (src/content/events/events.md), rendered by
 * src/pages/events.astro via src/components/events/{Hero,UpcomingEvents,
 * EventFormats,EventsCTA}.astro. The live schedule itself comes from an
 * Eventbrite webhook at runtime and has no CMS fields - not shown here,
 * matching events.astro's own comment that there is no dummy data to
 * fall back to. `UpcomingEvents.astro`'s empty-state button uses
 * `host_cta`, which events.astro passes in as `data.hero.secondary_cta`
 * (not its own field) - reproduced the same way here.
 * ------------------------------------------------------------------- */
var EventsPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var hero = field(entry, ['hero'], {});
    var upcoming = field(entry, ['upcoming'], {});
    var formats = field(entry, ['formats'], {});
    var formatCards = list(entry, ['formats', 'cards']);
    var past = field(entry, ['past'], {});
    var cta = field(entry, ['cta'], {});
    var ctaPoints = list(entry, ['cta', 'points']);
    var getAsset = this.props.getAsset || function (p) { return p; };

    return h('div', { className: 'events-page' },
      h('section', { className: 'events-hero' },
        h('div', { className: 'container' },
          h('div', { className: 'events-hero-inner' },
            h('span', { className: 'events-badge' }, hero.badge),
            h('h1', { className: 'events-hero-title' }, (hero.title_part_1 || '') + ' ', h('span', { className: 'events-gradient-text' }, hero.title_part_2)),
            h('p', { className: 'events-hero-subtitle' }, hero.subtitle),
            h('div', { className: 'events-hero-actions' },
              hero.primary_cta ? h('span', { className: 'btn primary-button' }, hero.primary_cta.label) : null,
              hero.secondary_cta ? h('span', { className: 'btn' }, hero.secondary_cta.label) : null
            )
          )
        )
      ),
      h('section', { className: 'events-section' },
        h('div', { className: 'container' },
          h('div', { className: 'events-section-head' },
            h('h2', { className: 'events-section-title' }, upcoming.title),
            h('p', { className: 'events-section-subtitle' }, upcoming.subtitle)
          ),
          h('div', { className: 'events-empty is-visible' },
            h('p', {}, upcoming.empty_message),
            hero.secondary_cta ? h('div', { className: 'events-empty-cta' }, h('span', { className: 'btn' }, hero.secondary_cta.label)) : null
          )
        )
      ),
      h('section', { className: 'events-section' },
        h('div', { className: 'container' },
          h('div', { className: 'events-section-head' },
            h('span', { className: 'events-badge' }, formats.badge),
            h('h2', { className: 'events-section-title' }, formats.title),
            h('p', { className: 'events-section-subtitle' }, formats.subtitle)
          ),
          h('div', { className: 'formats-grid' },
            formatCards.map(function (card, i) {
              return h('article', { className: 'format-card', key: i },
                card.icon ? h('div', { className: 'format-card-icon' }, h('img', { src: getAsset(card.icon), alt: card.alt, width: 30, height: 30 })) : null,
                h('h3', { className: 'format-card-title' }, card.title),
                h('p', { className: 'format-card-desc' }, card.description),
                h('p', { className: 'format-card-meta' }, card.meta)
              );
            })
          )
        )
      ),
      h('section', { className: 'events-section' },
        h('div', { className: 'container' },
          h('div', { className: 'events-section-head' },
            h('span', { className: 'events-badge' }, past.badge),
            h('h2', { className: 'events-section-title' }, past.title),
            h('p', { className: 'events-section-subtitle' }, past.subtitle)
          )
        )
      ),
      h('section', { className: 'events-section' },
        h('div', { className: 'container' },
          h('div', { className: 'events-cta-panel' },
            h('div', {},
              h('h2', { className: 'events-cta-title' }, cta.title),
              h('p', { className: 'events-cta-desc' }, cta.description),
              h('div', { className: 'events-cta-actions' },
                cta.primary_cta ? h('span', { className: 'btn primary-button' }, cta.primary_cta.label) : null,
                cta.secondary_cta ? h('span', { className: 'btn' }, cta.secondary_cta.label) : null
              )
            ),
            h('ul', { className: 'events-cta-points' },
              ctaPoints.map(function (p, i) { return h('li', { key: i }, p); })
            )
          )
        )
      )
    );
  },
});

// Decap keys registerPreviewTemplate for a *files* collection by the
// individual file's `name` (per public/admin/config.yml - here the file
// is named "events", not the collection "events_page"), not the
// collection's own name. See docs: decapcms.org/docs/customization/ and
// decapcms.org/docs/collection-file/. home/about happened to "work"
// earlier only because their file name equals their collection name.
CMS.registerPreviewTemplate('events', EventsPreview);

/* ---------------------------------------------------------------------
 * Services page copy (src/content/services/services.md), rendered by
 * src/pages/services/index.astro. Fields used there: data_architecture,
 * data_devops, data_science, data_visualization (each
 * {heading,text,icon1_heading,icon1_text,icon2_heading,icon2_text}).
 * `individual_page` is declared in the schema/config but grepped for
 * across all of src/ - zero matches outside config.ts/config.yml. No
 * component reads it; not rendered here.
 * The real page wraps all four blocks in `<main class="page-wrapper
 * bg-image">` (a dark repeating background, defined in index.astro's own
 * Astro-scoped <style> and copied into public/admin/preview.css by hand
 * since it isn't in any src/styles/*.css file) and uses inline
 * white/rgba(255,255,255,.7) text colours because of that dark
 * background - both reproduced here, along with the real per-block image,
 * alternating image-container-left/right, and the "Know more" link.
 * The actual icon SVGs are swapped out (decorative, index-keyed, not CMS
 * fields) but the icon box classes and real icon1/icon2 copy are kept.
 * ------------------------------------------------------------------- */
var SERVICE_BLOCKS = [
  { key: 'data_architecture', image: '/assets/images/services/big_data.svg', imageSide: 'right', href: '/services/data-strategy-services/' },
  { key: 'data_devops', image: '/assets/images/services/devops.svg', imageSide: 'left', href: '/services/data-engineering-services/' },
  { key: 'data_science', image: '/assets/images/services/data_science.svg', imageSide: 'right', href: '/services/data-science/' },
  { key: 'data_visualization', image: '/assets/images/services/data_visualisation.svg', imageSide: 'left', href: '/services/ai-solutions/' },
];

function renderServiceBlock(def, block, getAsset) {
  var imageCol = h('div', { className: 'col-md-6 offset-xl-1 pb-2 mb-4 mb-md-0', key: 'img' },
    h('div', { className: def.imageSide === 'right' ? 'image-container-right' : 'image-container-left' },
      h('img', { className: 'images', src: getAsset(def.image), alt: 'Image', style: { maxHeight: '220px' } })
    )
  );
  var textCol = h('div', { className: 'col-md-6 col-xl-5 pt-md-2', key: 'text' },
    h('div', { className: 'pe-md-4 pe-xl-0' },
      h('h2', { className: 'pb-2 pb-lg-3', style: { color: 'white' } }, block.heading),
      h('p', { className: 'pb-2 pb-lg-0 mb-3 mb-lg-3', style: { color: 'rgba(255, 255, 255, 0.7)' } }, block.text),
      h('div', { className: 'row row-cols-2' },
        h('div', { className: 'col' },
          h('div', { className: 'd-table rounded-1 p-2 mb-3', style: { backgroundColor: 'rgba(255, 255, 255, 0.03)', width: '36px', height: '36px' } }),
          h('h3', { className: 'h5 mb-2', style: { color: 'white' } }, block.icon1_heading),
          h('p', { className: 'fs-sm mb-0', style: { color: 'rgba(255, 255, 255, 0.7)' } }, block.icon1_text)
        ),
        h('div', { className: 'col' },
          h('div', { className: 'd-table rounded-1 p-2 mb-3', style: { backgroundColor: 'rgba(255, 255, 255, 0.03)', width: '36px', height: '36px' } }),
          h('h3', { className: 'h5 mb-2', style: { color: 'white' } }, block.icon2_heading),
          h('p', { className: 'fs-sm mb-0', style: { color: 'rgba(255, 255, 255, 0.7)' } }, block.icon2_text)
        )
      ),
      h('a', { href: def.href, className: 'hyperlink-button' }, h('span', { className: 'hyperlink' }, 'Know more'))
    )
  );
  return h('div', { className: 'row align-items-start py-4 py-xl-5 my-2', key: def.key },
    def.imageSide === 'right' ? [imageCol, textCol] : [textCol, imageCol]
  );
}

var ServicesPagePreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var getAsset = this.props.getAsset || function (p) { return p; };
    return h('main', { className: 'page-wrapper bg-image' },
      h('section', { className: 'container sections py-4 py-sm-5' },
        SERVICE_BLOCKS.map(function (def) {
          return renderServiceBlock(def, field(entry, [def.key], {}), getAsset);
        })
      )
    );
  },
});

// Same file-name-not-collection-name rule as events above: the file is
// named "services", the collection is "services_page".
CMS.registerPreviewTemplate('services', ServicesPagePreview);

/* ---------------------------------------------------------------------
 * Service showcase pages (src/content/service-showcase/*.md), a files
 * collection with 4 entries of 2 different shapes:
 *   - ai-solutions.md: top-level ai_strategy/custom_ai_agents/
 *     agentic_workflows/generative_ai/rag_implementation/
 *     industry_use_cases/cta, rendered by src/components/services/
 *     AISolutions.astro via ServiceSection.astro + CTA.astro.
 *     `industry_use_cases` is commented out in AISolutions.astro
 *     (`<!--IndustryUseCases .../-->`) - a real component exists
 *     (IndustryUseCases.astro) but nothing invokes it, so that field is
 *     not rendered here either.
 *   - data-engineering.md / data-science.md / data-strategy.md: top-level
 *     title/subtitle/cards/industrySectionTitle/industrySectionSubtitle/
 *     pills/industries, all 3 rendered by the same generic
 *     ServiceShowcase.astro.
 * One registerPreviewTemplate covers the whole collection in Decap, so
 * this dispatches on a field unique to each shape: `ai_strategy` only
 * exists on the ai-solutions entry.
 * ------------------------------------------------------------------- */
var ServiceSectionPreview = function (id, section, getAsset) {
  var cards = (section.cards || []);
  var resolveAsset = getAsset || function (p) { return p; };
  return h('section', { id: id, key: id, className: 'service-section' },
    h('div', { className: 'align-items-center h-100 d-flex flex-column' },
      h('div', { className: 'mb-4 mb-lg-0 w-100' },
        h('div', { className: 'service-badge' }, h('span', {}, section.badge)),
        h('h2', { className: 'service-heading' }, section.heading),
        h('p', { className: 'service-lead-text' }, section.text)
      ),
      h('div', { className: 'w-100 mt-auto' },
        section.image_placeholder ? h('div', { className: 'service-image-container mb-4' },
          h('img', { className: 'service-section-image', src: resolveAsset(section.image_placeholder), alt: section.heading })
        ) : null,
        h('div', { className: 'row row-cols-1 row-cols-xl-3 g-3 mb-4' },
          cards.map(function (card, i) {
            return h('div', { className: 'col', key: i },
              h('div', { className: 'service-info-card' },
                h('h3', { className: 'service-info-card-title' }, card.title),
                h('p', { className: 'service-info-card-text' }, card.description)
              )
            );
          })
        )
      )
    )
  );
};

// Plain functions, not createClass() components: createClass() (really
// create-react-class under decap-cms.js) returns a component *constructor*
// whose render lives on .prototype, not as a property of the constructor
// itself. An earlier version of this file called
// `AiSolutionsShowcasePreview.render.call(...)` on a createClass() result,
// which is undefined in the real browser runtime (only the identity-stub
// `createClass` in a headless test harness would make that line "work").
// Keeping these as ordinary functions that return an element tree sidesteps
// the whole problem - no `this`, no prototype, just a function call.
function renderAiSolutionsShowcase(entry, getAsset) {
  var sectionKeys = ['ai_strategy', 'custom_ai_agents', 'agentic_workflows', 'generative_ai', 'rag_implementation'];
  var cta = field(entry, ['cta'], {});
  return h('div', { style: { marginTop: '70px' } },
    h('section', { className: 'py-5' },
      h('div', { className: 'container' },
        h('div', { className: 'row row-cols-1 row-cols-lg-2' },
          sectionKeys.map(function (key) {
            return ServiceSectionPreview(key, field(entry, [key], {}), getAsset);
          })
        )
      )
    ),
    h('section', { className: 'cta-section' },
      h('div', { className: 'container' },
        h('div', { className: 'row justify-content-center' },
          h('div', { className: 'col-lg-10 text-center' },
            h('h2', { className: 'cta-title' }, cta.heading),
            h('p', { className: 'cta-text' }, cta.text),
            h('span', { className: 'btn primary-button' }, cta.button_text)
          )
        )
      )
    )
  );
}

function renderGenericServiceShowcase(entry, getAsset) {
  var title = field(entry, ['title'], '');
  var subtitle = field(entry, ['subtitle'], '');
  var cards = list(entry, ['cards']);
  var industrySectionTitle = field(entry, ['industrySectionTitle'], '');
  var industrySectionSubtitle = field(entry, ['industrySectionSubtitle'], '');
  var pills = list(entry, ['pills']);
  var industries = field(entry, ['industries'], {});

  return h('div', {},
    h('section', { className: 'service-showcase-section' },
      h('div', { className: 'container' },
        h('h2', { className: 'service-showcase-main-title' }, title),
        h('p', { className: 'service-showcase-main-subtitle' }, subtitle),
        h('div', { className: 'service-showcase-grid' },
          cards.map(function (card, i) {
            var isWide = i === 0 || i === 3 || i === 4;
            var body = h('div', { className: isWide ? 'bento-content' : 'service-showcase-body' },
              h('div', { className: 'service-showcase-icon-wrapper' }),
              card.frontImage ? h('img', { src: getAsset(card.frontImage), alt: card.title, style: { maxWidth: '100%' } }) : null,
              h('h3', { className: 'service-showcase-card-title' }, card.title),
              h('p', { className: 'service-showcase-card-text' }, card.description)
            );
            return h('div', { className: 'service-showcase-card' + (isWide ? ' bento-wide' : ''), key: i },
              h('div', { className: 'service-showcase-glow' }),
              body
            );
          })
        )
      )
    ),
    h('section', { style: { padding: '80px 0' } },
      h('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' } },
        h('h2', { style: { textAlign: 'center', marginBottom: '0.5rem' } }, industrySectionTitle),
        h('p', { className: 'section-lead', style: { textAlign: 'center', marginBottom: '3rem' } }, industrySectionSubtitle),
        h('div', { className: 'industry-pills-container' },
          pills.map(function (pill, i) {
            return h('button', { className: 'industry-pill' + (i === 0 ? ' active-pill' : ''), key: i }, pill.label);
          })
        ),
        h('div', { style: { padding: '2.5rem', backgroundColor: 'var(--bg-contrast)', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' } },
          Object.keys(industries).map(function (key) {
            var industry = industries[key];
            var bullets = (industry && industry.bullets) || [];
            return h('div', { className: 'industry-content', key: key },
              h('h3', { style: { marginBottom: '1.25rem' } }, industry.title),
              h('ul', { style: { lineHeight: '1.8', paddingLeft: '1.5rem' } }, bullets.map(function (b, i) { return h('li', { key: i, style: { marginBottom: '0.75rem' } }, b); }))
            );
          })
        )
      )
    )
  );
}

var ServiceShowcaseDispatchPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var getAsset = this.props.getAsset || function (p) { return p; };
    var hasAiShape = field(entry, ['ai_strategy'], null) !== null;
    return hasAiShape
      ? renderAiSolutionsShowcase(entry, getAsset)
      : renderGenericServiceShowcase(entry, getAsset);
  },
});

// service_showcase is a *files* collection with 4 files (ai_solutions,
// data_engineering, data_science, data_strategy - see config.yml). Decap
// needs one registerPreviewTemplate call per file name, not one call
// under the collection name "service_showcase" (which is what this file
// did before and which Decap silently ignores, falling back to the
// default raw-field-dump preview). The same dispatcher component is
// fine to reuse for all 4, since it already picks the right shape from
// the entry's own fields at render time.
CMS.registerPreviewTemplate('ai_solutions', ServiceShowcaseDispatchPreview);
CMS.registerPreviewTemplate('data_engineering', ServiceShowcaseDispatchPreview);
CMS.registerPreviewTemplate('data_science', ServiceShowcaseDispatchPreview);
CMS.registerPreviewTemplate('data_strategy', ServiceShowcaseDispatchPreview);

/* ---------------------------------------------------------------------
 * Startups page (src/content/startups/startups.md), rendered by
 * src/pages/startups.astro via src/components/startups/{Hero,Dilemma,
 * Capabilities,IndustryVerticals,HowItWorks,Pricing,FAQ,ApplyForm}.astro.
 * Collection "startups_page", file name "startups" (see the file-name
 * rule noted above events/services).
 * NOT editable here, by design:
 *   - startups.astro's own seoTitle/seoDescription/seoKeywords and its
 *     two hardcoded JSON-LD <script> blocks (FAQPage + Service schema) -
 *     SEO/structured data, left untouched. Three of those JSON-LD
 *     answers are copied by hand from the FAQ content below; editing an
 *     FAQ answer in the CMS will NOT update the JSON-LD, so the two can
 *     drift out of sync - a known, accepted gap, not a bug here.
 *   - ApplyForm.astro's Google Form id/entry-id constants and its submit
 *     script - business logic (lead capture), not content. Only the
 *     form's heading/subtitle/success copy/button text are CMS fields;
 *     field labels, placeholders, and select options stay hardcoded.
 *   - Every decorative, non-data SVG (the big hero graphic, per-card
 *     icons, arrow icons) - index-keyed in the real components, not
 *     backed by any CMS field.
 * ------------------------------------------------------------------- */
var StartupsPreview = createClass({
  render: function () {
    var entry = this.props.entry;
    var hero = field(entry, ['hero'], {});
    var dilemma = field(entry, ['dilemma'], {});
    var dilemmaRows = list(entry, ['dilemma', 'rows']);
    var capabilities = field(entry, ['capabilities'], {});
    var capabilityCards = list(entry, ['capabilities', 'cards']);
    var industries = field(entry, ['industries'], {});
    var industryCards = list(entry, ['industries', 'cards']);
    var howItWorks = field(entry, ['how_it_works'], {});
    var steps = list(entry, ['how_it_works', 'steps']);
    var pricing = field(entry, ['pricing'], {});
    var pricingFeatures = list(entry, ['pricing', 'features']);
    var faq = field(entry, ['faq'], {});
    var faqItems = list(entry, ['faq', 'items']);
    var applyForm = field(entry, ['apply_form'], {});

    return h('div', {},
      h('section', { className: 'startup-hero' },
        h('div', { className: 'container' },
          h('div', { className: 'hero-badge' }, hero.badge),
          h('h1', {}, (hero.title_part_1 || '') + ' ', h('span', { className: 'gradient-text' }, hero.title_part_2)),
          h('p', {}, hero.description),
          h('div', {}, h('span', { className: 'btn' }, hero.button_text)),
          h('div', {}, hero.link_text)
        )
      ),
      h('section', { className: 'dilemma-section' },
        h('div', { className: 'container' },
          h('span', { className: 'eyebrow' }, dilemma.badge),
          h('h2', {}, dilemma.title),
          h('p', {}, dilemma.subtitle),
          h('div', { className: 'comparison-table-grid' },
            h('div', { className: 'comparison-header-row' },
              h('div', { className: 'comparison-cell cell-feature' }, h('span', { className: 'eyebrow opacity-50' }, 'Metrics')),
              h('div', { className: 'comparison-cell cell-inhouse' },
                h('div', { className: 'header-subtitle' }, dilemma.inhouse_subtitle),
                h('div', { className: 'header-title' }, dilemma.inhouse_title)
              ),
              h('div', { className: 'comparison-cell cell-pod' },
                h('div', { className: 'header-subtitle' }, dilemma.pod_subtitle),
                h('div', { className: 'header-title' }, dilemma.pod_title)
              )
            ),
            dilemmaRows.map(function (row, i) {
              return h('div', { className: 'comparison-row', key: i },
                h('div', { className: 'comparison-row-content' },
                  h('div', { className: 'comparison-cell cell-feature' }, h('span', {}, row.feature)),
                  h('div', { className: 'comparison-cell cell-inhouse' },
                    h('div', { className: 'value-highlight text-coral' }, row.inhouse_value),
                    h('div', { className: 'value-sub' }, row.inhouse_sub)
                  ),
                  h('div', { className: 'comparison-cell cell-pod' },
                    h('div', { className: 'value-highlight text-cyan' }, row.pod_value),
                    h('div', { className: 'value-sub' }, row.pod_sub)
                  )
                )
              );
            })
          )
        )
      ),
      h('section', { className: 'pod-services' },
        h('div', { className: 'container' },
          h('span', { className: 'eyebrow' }, capabilities.badge),
          h('h2', {}, capabilities.title),
          h('p', {}, capabilities.subtitle),
          h('div', { className: 'row g-4' },
            capabilityCards.map(function (card, i) {
              return h('div', { className: 'col-lg-3 col-md-6', key: i },
                h('div', { className: 'service-card' },
                  h('h3', { className: 'h5' }, card.title),
                  h('p', {}, card.description)
                )
              );
            })
          )
        )
      ),
      h('section', { className: 'industry-verticals-section' },
        h('div', { className: 'container' },
          h('span', { className: 'eyebrow' }, industries.badge),
          h('h2', {}, industries.title),
          h('p', {}, industries.subtitle),
          h('div', { className: 'row g-4' },
            industryCards.map(function (card, i) {
              return h('div', { className: 'col-lg-4 col-md-6', key: i },
                h('div', { className: 'industry-vertical-card' },
                  h('h3', { className: 'h6 card-title' }, card.title)
                )
              );
            })
          )
        )
      ),
      h('section', { className: 'how-it-works' },
        h('div', { className: 'container' },
          h('span', { className: 'eyebrow' }, howItWorks.badge),
          h('h2', {}, howItWorks.title),
          h('p', {}, howItWorks.subtitle),
          h('div', { className: 'row g-4' },
            steps.map(function (step, i) {
              return h('div', { className: 'col-lg-4', key: i },
                h('div', { className: 'step-card' },
                  h('div', { className: 'step-large-num' }, String(i + 1).padStart(2, '0')),
                  h('span', { className: 'step-badge' }, step.phase),
                  h('h3', { className: 'h4' }, step.title),
                  h('p', {}, step.description)
                )
              );
            })
          )
        )
      ),
      h('section', { className: 'pricing-section' },
        h('div', { className: 'container' },
          h('span', { className: 'eyebrow' }, pricing.badge),
          h('h2', {}, pricing.title),
          h('p', {}, pricing.subtitle),
          h('div', { className: 'pricing-premium-card primary-pod single-card' },
            h('div', { className: 'card-content' },
              h('div', { className: 'card-badge' }, pricing.package_label),
              h('h3', { className: 'card-plan-title' }, pricing.plan_title),
              h('div', { className: 'price-container' },
                h('span', { className: 'currency' }, pricing.currency),
                h('span', { className: 'amount' }, pricing.amount),
                h('span', { className: 'period' }, pricing.period)
              ),
              h('div', { className: 'savings-capsule' }, pricing.savings_text),
              h('p', { className: 'card-plan-desc-single' }, pricing.description),
              h('h4', { className: 'eyebrow' }, pricing.features_label),
              h('ul', { className: 'card-features-list card-features-grid' },
                pricingFeatures.map(function (feature, i) {
                  return h('li', { key: i }, h('span', {}, feature));
                })
              ),
              h('span', { className: 'btn-pricing-cta primary-btn' }, pricing.cta_text)
            )
          ),
          h('p', { className: 'pricing-comparison-footer' }, pricing.footer_text)
        )
      ),
      h('section', { className: 'faq-section' },
        h('div', { className: 'container', style: { maxWidth: '800px' } },
          h('span', { className: 'eyebrow' }, faq.badge),
          h('h2', {}, faq.title),
          h('div', { className: 'faq-accordion' },
            faqItems.map(function (item, i) {
              return h('details', { className: 'faq-item', open: i === 0, key: i },
                h('summary', { className: 'faq-summary' }, h('span', { className: 'faq-question-content' }, item.question)),
                h('div', { className: 'faq-answer' }, item.answer)
              );
            })
          )
        )
      ),
      h('section', { className: 'form-section' },
        h('div', { className: 'container', style: { maxWidth: '400px' } },
          h('div', { className: 'startup-form-container' },
            h('h2', {}, applyForm.title),
            h('p', {}, applyForm.subtitle),
            h('div', { style: { marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(15,37,35,0.1)' } },
              h('h3', {}, applyForm.success_title),
              h('p', {}, applyForm.success_text),
              h('span', { className: 'btn btn-outline-primary' }, applyForm.submit_another_text)
            ),
            h('div', { style: { marginTop: '1.5rem' } }, h('span', { className: 'btn btn-primary' }, applyForm.button_text))
          )
        )
      )
    );
  },
});

CMS.registerPreviewTemplate('startups', StartupsPreview);
