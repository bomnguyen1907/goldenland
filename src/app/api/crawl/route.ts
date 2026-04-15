import Parser from 'rss-parser'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import axios from 'axios'
import * as cheerio from 'cheerio'

// ============================================================
// CẤU HÌNH HEADERS GỌI API & CÀO DATA
// ============================================================
const DEFAULT_HTTP_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml',
  'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
}

// ============================================================
// CẤU HÌNH NGUỒN RSS & SELECTORS
// ============================================================
const RSS_SOURCES = [
  {
    name: 'VnExpress Bất động sản',
    url: 'https://vnexpress.net/rss/bat-dong-san.rss',
    selectors: {
      content: 'article.fck_detail',
      description: 'p.description',
      author: 'p.author_mail strong, span.author',
    },
    removeSelectors: [
      'script', 'style', 'iframe', 'noscript',
      '.banner', '.box-comment', '.box_brief_info',
      '.box-tinlienquanv2', '.social-pin', '.box_tag',
      '.box_xemthem', '.footer', 'nav', '.menu',
      '.box_author', '.box_social', '.box-sponsor',
      '.item_slide_show .desc_cation',
      '.box_comment_vne', '.social_pin',
    ],
    maxArticles: 10,
  },
  {
    name: 'Dân Trí Bất động sản',
    url: 'https://dantri.com.vn/rss/bat-dong-san.rss',
    selectors: {
      // Dân Trí thường dùng e-magazine hoặc bài thường, selector này bao quát hơn
      content: '.singular-content, .dt-news__content', 
      description: '.singular-sapo, .dt-news__sapo',
      author: '.author-name, .dt-news__author',
    },
    removeSelectors: ['script', 'style', 'iframe', '.dt-ads', '.m-related', '.content-tag'],
    maxArticles: 5,
  },
  {
    name: 'Vietnamnet Bất động sản',
    url: 'https://vietnamnet.vn/rss/bat-dong-san.rss',
    selectors: {
      content: '.maincontent, .article-content',
      description: '.content-detail-sapo, .vnn-sapo',
      author: '.article-author .name, .author-info',
    },
    removeSelectors: ['script', 'style', 'iframe', '.vnn-res-notcontent', '.content-detail-ads'],
    maxArticles: 5,
  },
]

// ============================================================
// TIỆN ÍCH
// ============================================================

// ============================================================
// LUẬT TỰ ĐỘNG PHÂN LOẠI DANH MỤC
// ============================================================
// Thứ tự trong mảng quyết định độ ưu tiên (HN & HCM ưu tiên giải quyết trước)
const CATEGORY_RULES = [
  { slug: 'bat-dong-san-tp-hcm', name: 'Bất động sản TP HCM', keywords: ['tp.hcm', 'hồ chí minh', 'sài gòn', 'thủ đức', 'quận 1', 'quận 2', 'quận 3', 'quận 7', 'quận 9', 'tphcm', 'tp hcm', 'tân bình', 'bình thạnh', 'phú nhuận', 'gò vấp'] },
  { slug: 'bat-dong-san-ha-noi', name: 'Bất động sản Hà Nội', keywords: ['hà nội', 'thủ đô', 'cầu giấy', 'hoàn kiếm', 'từ liêm', 'đống đa', 'hai bà trưng', 'thanh xuân', 'hà đông', 'ba đình', 'tây hồ', 'hoàng mai', 'long biên'] },
  { slug: 'can-ho-chung-cu', name: 'Căn hộ chung cư', keywords: ['căn hộ', 'chung cư', 'condominium', 'nhà tập thể', 'penthouse', 'duplex', 'chung cư cao cấp', 'căn hộ cao cấp'] },
  { slug: 'dat-nen', name: 'Đất nền', keywords: ['đất nền', 'phân lô', 'đất thổ cư', 'đất dự án', 'đất nền dự án', 'lô đất', 'quy hoạch', 'giải tỏa', 'sổ đỏ', 'sổ hồng', 'đất nông nghiệp'] },
  { slug: 'bat-dong-san-nghi-duong', name: 'Bất động sản nghỉ dưỡng', keywords: ['nghỉ dưỡng', 'condotel', 'villa', 'resort', 'biệt thự biển', 'biệt thự nghỉ dưỡng', 'homestay', 'farmstay', 'shophouse biển'] },
]

function detectCategoryId(text: string, categoryIdMap: Record<string, number>): number {
  const lowerText = text.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => lowerText.includes(kw))) {
      return categoryIdMap[rule.slug]
    }
  }
  return categoryIdMap['tin-tuc-bds'] // Mặc định
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ============================================================
// TẢI ẢNH TỪ URL VÀ UPLOAD LÊN PAYLOAD MEDIA
// ============================================================
async function downloadAndUploadImage(imageUrl: string, altText: string, payload: any) {
  try {
    if (!imageUrl || imageUrl.startsWith('data:')) return null

    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        ...DEFAULT_HTTP_HEADERS,
        'Referer': new URL(imageUrl).origin
      }
    })

    const buffer = Buffer.from(response.data)
    if (buffer.byteLength < 5000) return null

    const mediaDoc = await payload.create({
      collection: 'media',
      data: { alt: altText.substring(0, 150) },
      file: {
        data: buffer,
        mimetype: response.headers['content-type'] || 'image/jpeg',
        name: `crawled-${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`,
      },
    })
    return mediaDoc.id
  } catch (e) {
    return null
  }
}

// ============================================================
// CHUYỂN ĐỔI HTML → LEXICAL JSON
// Hỗ trợ: paragraph, heading, bold, italic, link, image, list, blockquote
// ============================================================

interface LexicalNode {
  type: string
  version: number
  [key: string]: any
}

/**
 * Tạo Lexical text node với format
 * format: 0=normal, 1=bold, 2=italic, 3=bold+italic, 8=underline
 */
function createTextNode(text: string, format: number = 0): LexicalNode {
  return {
    type: 'text',
    text,
    format,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

/** Tạo một paragraph node */
function createParagraphNode(children: LexicalNode[]): LexicalNode {
  return {
    type: 'paragraph',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: '',
  }
}

/** Tạo heading node (h1-h6) */
function createHeadingNode(tag: string, children: LexicalNode[]): LexicalNode {
  const level = parseInt(tag.replace('h', ''), 10)
  return {
    type: 'heading',
    tag: `h${Math.min(Math.max(level, 1), 6)}`,
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

/** Tạo link node */
function createLinkNode(url: string, children: LexicalNode[]): LexicalNode {
  return {
    type: 'link',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 3,
    fields: {
      linkType: 'custom',
      newTab: true,
      url,
    },
  }
}

/** Tạo upload node (ảnh đã upload lên Payload) */
function createUploadNode(mediaId: string): LexicalNode {
  return {
    type: 'upload',
    version: 4,
    format: '',
    value: mediaId,
    relationTo: 'media',
  }
}

/** Tạo list node */
function createListNode(tag: string, items: LexicalNode[][]): LexicalNode {
  const listType = tag === 'ol' ? 'number' : 'bullet'
  return {
    type: 'list',
    listType,
    start: 1,
    tag,
    children: items.map((itemChildren, index) => ({
      type: 'listitem',
      children: itemChildren.length > 0 ? itemChildren : [createTextNode('')],
      direction: 'ltr',
      format: '',
      indent: 0,
      value: index + 1,
      version: 1,
    })),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

/** Tạo blockquote node */
function createQuoteNode(children: LexicalNode[]): LexicalNode {
  return {
    type: 'quote',
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

/**
 * Duyệt các children nodes của 1 element và trích xuất inline content (text, bold, italic, link…)
 */
function parseInlineChildren($: cheerio.CheerioAPI, element: cheerio.Cheerio<any>): LexicalNode[] {
  const children: LexicalNode[] = []

  element.contents().each((_i, node) => {
    if (node.type === 'text') {
      const text = $(node).text()
      if (text.trim()) {
        children.push(createTextNode(text))
      }
    } else if (node.type === 'tag') {
      const el = $(node)
      const tagName = (node as any).tagName?.toLowerCase()

      if (tagName === 'strong' || tagName === 'b') {
        const text = el.text().trim()
        if (text) children.push(createTextNode(text, 1)) // bold
      } else if (tagName === 'em' || tagName === 'i') {
        const text = el.text().trim()
        if (text) children.push(createTextNode(text, 2)) // italic
      } else if (tagName === 'u') {
        const text = el.text().trim()
        if (text) children.push(createTextNode(text, 8)) // underline
      } else if (tagName === 'a') {
        const href = el.attr('href')
        const text = el.text().trim()
        if (href && text) {
          children.push(createLinkNode(href, [createTextNode(text)]))
        } else if (text) {
          children.push(createTextNode(text))
        }
      } else if (tagName === 'br') {
        children.push(createTextNode('\n'))
      } else if (tagName === 'span') {
        // Đệ quy xử lý span
        const spanChildren = parseInlineChildren($, el)
        children.push(...spanChildren)
      } else {
        // Fallback: lấy text
        const text = el.text().trim()
        if (text) children.push(createTextNode(text))
      }
    }
  })

  return children
}

/**
 * PARSER CHÍNH: Chuyển HTML thành mảng Lexical block nodes
 * Trả về mảng LexicalNode[] (các block-level nodes)
 * imageIds: map từ imageUrl → mediaId (đã upload)
 */
function htmlToLexicalBlocks(
  $: cheerio.CheerioAPI,
  container: cheerio.Cheerio<any>,
  imageIds: Map<string, string>,
): LexicalNode[] {
  const blocks: LexicalNode[] = []

  container.children().each((_i, node) => {
    if (node.type !== 'tag') return
    const el = $(node)
    const tagName = (node as any).tagName?.toLowerCase()

    // Skip empty elements
    if (!el.text().trim() && !el.find('img').length) return

    // ---- HEADINGS ----
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      const children = parseInlineChildren($, el)
      if (children.length > 0) {
        blocks.push(createHeadingNode(tagName, children))
      }
      return
    }

    // ---- IMAGES (standalone) ----
    if (tagName === 'img' || tagName === 'figure' || tagName === 'picture') {
      let imgSrc = ''
      if (tagName === 'img') {
        imgSrc = el.attr('data-src') || el.attr('src') || ''
      } else {
        const img = el.find('img')
        imgSrc = img.attr('data-src') || img.attr('src') || ''
      }

      if (imgSrc) {
        const mediaId = imageIds.get(imgSrc)
        if (mediaId) {
          blocks.push(createUploadNode(mediaId))
        }
      }

      // Nếu figure có figcaption, thêm caption dạng italic
      const caption = el.find('figcaption')
      if (caption.length > 0) {
        const captionText = caption.text().trim()
        if (captionText) {
          blocks.push(createParagraphNode([createTextNode(captionText, 2)]))
        }
      }
      return
    }

    // ---- LISTS ----
    if (tagName === 'ul' || tagName === 'ol') {
      const items: LexicalNode[][] = []
      el.children('li').each((_j, li) => {
        const liChildren = parseInlineChildren($, $(li))
        items.push(liChildren.length > 0 ? liChildren : [createTextNode('')])
      })
      if (items.length > 0) {
        blocks.push(createListNode(tagName, items))
      }
      return
    }

    // ---- BLOCKQUOTE ----
    if (tagName === 'blockquote') {
      const children = parseInlineChildren($, el)
      if (children.length > 0) {
        blocks.push(createQuoteNode(children))
      }
      return
    }

    // ---- DIV / SECTION (container) — đệ quy vào trong ----
    if (['div', 'section', 'article', 'main'].includes(tagName)) {
      const innerBlocks = htmlToLexicalBlocks($, el, imageIds)
      blocks.push(...innerBlocks)
      return
    }

    // ---- TABLE ----
    if (tagName === 'table') {
      // Đơn giản hóa: chuyển table thành các dòng text
      el.find('tr').each((_j, tr) => {
        const cells: string[] = []
        $(tr).find('td, th').each((_k, cell) => {
          cells.push($(cell).text().trim())
        })
        if (cells.length > 0) {
          blocks.push(createParagraphNode([createTextNode(cells.join(' | '))]))
        }
      })
      return
    }

    // ---- PARAGRAPH & default ----
    // Xử lý <p> và các tag khác
    const inlineChildren = parseInlineChildren($, el)

    // Kiểm tra ảnh inline trong paragraph
    el.find('img').each((_j, img) => {
      const imgSrc = $(img).attr('data-src') || $(img).attr('src') || ''
      if (imgSrc) {
        const mediaId = imageIds.get(imgSrc)
        if (mediaId) {
          blocks.push(createUploadNode(mediaId))
        }
      }
    })

    if (inlineChildren.length > 0) {
      blocks.push(createParagraphNode(inlineChildren))
    }
  })

  return blocks
}

// ============================================================
// DEBUG: TÌM SELECTOR CHỨA NỘI DUNG NHIỀU NHẤT
// ============================================================

function findBestContentSelector($: cheerio.CheerioAPI): { selector: string; elementCount: number } | null {
  const candidates = [
    'article',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content-main',
    '.main-content',
    '[class*="article"]',
    '[class*="content"]',
    'main article',
    'main',
    '[role="main"]',
  ]

  let best = { selector: '', elementCount: 0 }

  for (const selector of candidates) {
    const $el = $(selector)
    if ($el.length === 0) continue

    // Tính số text nodes (càng nhiều càng tốt)
    let textCount = 0
    $el.each((_i, node) => {
      textCount += $(node).find('p, h1, h2, h3, h4, h5, h6, li').length
    })

    if (textCount > best.elementCount) {
      best = { selector, elementCount: textCount }
    }
  }

  return best.elementCount > 0 ? best : null
}

// ============================================================
// CÀO NỘI DUNG ĐẦY ĐỦ TỪ TRANG GỐC
// ============================================================

interface FullArticleData {
  lexicalBlocks: LexicalNode[]
  thumbnailId: string | null
  author: string | null
}

async function scrapeFullArticle(

  url: string,
  sourceConfig: (typeof RSS_SOURCES)[0],
  rssItem: any,
  payload: any,
): Promise<FullArticleData | null> {
  try {
    // Fetch trang bài viết
    const { data: html } = await axios.get(url, {
      headers: DEFAULT_HTTP_HEADERS,
      timeout: 15000,
    })

    const $ = cheerio.load(html)

    // Xóa các phần tử không cần thiết
    sourceConfig.removeSelectors.forEach((selector) => {
      $(selector).remove()
    })

    // Lấy nội dung chính
    let contentElement = $(sourceConfig.selectors.content)
    
    // DEBUG: Log để kiểm tra selector
    const primarySelectors = sourceConfig.selectors.content.split(',').map(s => s.trim())
    console.log(`[Crawl] 🔍 Thử tìm nội dung với selectors: ${primarySelectors.join(' | ')}`)
    
    if (contentElement.length > 0) {
      console.log(`[Crawl] ✅ Tìm thấy content với selector chính`)
    } else {
      console.log(`[Crawl] ⚠️  Không tìm được selector chính, dùng auto-detect...`)
      const best = findBestContentSelector($)
      if (best) {
        console.log(`[Crawl] 🎯 Auto-detected selector: "${best.selector}" (${best.elementCount} elements)`)
        console.log(`[Crawl] ℹ️  Hãy cập nhật RSS_SOURCES cho ${sourceConfig.name}`)
        contentElement = $(best.selector)
      }
    }
    
    // Nếu vẫn không tìm được
    if (contentElement.length === 0) {
      console.log(`[Crawl] ❌ Không tìm thấy content element cho: ${url}`)
      console.log(`[Crawl] 💡 Cần update selectors cho ${sourceConfig.name}`)
      return null
    }

    // Lấy tên tác giả
    const author = $(sourceConfig.selectors.author).first().text().trim() || null

    // ---- THU THẬP VÀ TẢI TẤT CẢ ẢNH ----
    const imageUrls: string[] = []

    // Ảnh trong nội dung
    contentElement.find('img').each((_i, img) => {
      const src = $(img).attr('data-src') || $(img).attr('src') || ''
      if (src && !src.startsWith('data:') && !src.includes('pixel')) {
        imageUrls.push(src)
      }
    })

    // Thumbnail từ RSS
    let thumbnailUrl: string | null = null
    const imgMatch = rssItem.content?.match(/<img[^>]+src="([^">]+)"/)
    if (imgMatch && imgMatch[1]) {
      thumbnailUrl = imgMatch[1]
    }
    if (rssItem.enclosure?.url) {
      thumbnailUrl = rssItem.enclosure.url
    }

    // Tải ảnh song song (tối đa 6 ảnh trong bài + 1 thumbnail)
    const imageIds = new Map<string, string>()
    const allImageUrls = [...new Set(imageUrls)].slice(0, 6) // Giới hạn 6 ảnh

    console.log(`[Crawl] Đang tải ${allImageUrls.length} ảnh trong bài...`)

    await Promise.all(
      allImageUrls.map(async (imgUrl) => {
        const mediaId = await downloadAndUploadImage(imgUrl, rssItem.title || 'Ảnh bài viết', payload)
        if (mediaId) {
          imageIds.set(imgUrl, mediaId)
        }
      }),
    )

    // Tải thumbnail riêng
    let thumbnailId: string | null = null
    if (thumbnailUrl) {
      thumbnailId = await downloadAndUploadImage(thumbnailUrl, rssItem.title || 'Thumbnail', payload)
    }
    // Nếu không có thumbnail riêng, dùng ảnh đầu tiên trong bài
    if (!thumbnailId && imageIds.size > 0) {
      thumbnailId = imageIds.values().next().value ?? null
    }

    // ---- CHUYỂN ĐỔI HTML → LEXICAL ----
    const lexicalBlocks = htmlToLexicalBlocks($, contentElement, imageIds)

    // Nếu không trích xuất được gì, fallback về text thuần
    if (lexicalBlocks.length === 0) {
      const plainText = contentElement.text().trim()
      if (plainText) {
        // Tách theo đoạn
        const paragraphs = plainText.split(/\n\s*\n/).filter((p) => p.trim())
        for (const p of paragraphs) {
          lexicalBlocks.push(createParagraphNode([createTextNode(p.trim())]))
        }
      }
    }

    // Thêm nguồn bài viết ở cuối
    lexicalBlocks.push(
      createParagraphNode([
        createTextNode(''),
      ]),
    )
    lexicalBlocks.push(
      createParagraphNode([
        createTextNode('Nguồn: ', 1), // bold
        createLinkNode(url, [createTextNode(url)]),
      ]),
    )

    return {
      lexicalBlocks,
      thumbnailId,
      author,
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Crawl] Lỗi khi cào nội dung ${url}: ${errMsg}`)
    return null
  }
}

// ============================================================
// ROUTE HANDLER: GET /api/crawl
// ============================================================

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const parser = new Parser()

    // Lấy user làm author
    const { docs: users } = await payload.find({ collection: 'users', limit: 1 })
    if (users.length === 0) {
      return Response.json(
        { error: 'Lỗi: Hệ thống chưa có User nào để làm tác giả bài viết!' },
        { status: 400 },
      )
    }
    const authorId = users[0].id

    // Lấy hoặc tạo tự động tất cả các category cần thiết
    const categoryIdMap: Record<string, number> = {}
    const allExpectedCategories = [
      ...CATEGORY_RULES.map(r => ({ slug: r.slug, name: r.name })),
      { slug: 'tin-tuc-bds', name: 'Tin tức BĐS' }
    ]

    for (const catConf of allExpectedCategories) {
      const { docs } = await payload.find({
        collection: 'article-categories',
        where: { slug: { equals: catConf.slug } },
        limit: 1,
      })

      if (docs.length > 0) {
        categoryIdMap[catConf.slug] = docs[0].id
      } else {
        const newCat = await payload.create({
          collection: 'article-categories',
          data: {
            name: catConf.name,
            slug: catConf.slug,
            description: `Danh mục phân loại bài viết RSS`,
            isActive: true,
          } as any,
        })
        categoryIdMap[catConf.slug] = newCat.id
      }
    }

    const totalStats = { created: 0, skipped: 0, errors: 0, sources: [] as string[] }

    // Duyệt từng nguồn RSS
    for (const source of RSS_SOURCES) {
      console.log(`[Crawl] 📡 Đang cào từ: ${source.name}`)

      try {
        const feed = await parser.parseURL(source.url)
        console.log(`[Crawl] ${source.name}: Tìm thấy ${feed.items.length} bài viết`)

        const items = feed.items.slice(0, source.maxArticles)

        for (const item of items) {
          if (!item.title || !item.link) {
            totalStats.skipped++
            continue
          }

          // Kiểm tra bài viết đã tồn tại chưa
          const slug = slugify(item.title)
          const existing = await payload.find({
            collection: 'articles',
            where: {
              or: [
                { title: { equals: item.title } },
                { slug: { equals: slug } },
              ],
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            totalStats.skipped++
            continue
          }

          try {
            // ===== CÀO NỘI DUNG ĐẦY ĐỦ =====
            console.log(`[Crawl] 🔍 Đang cào chi tiết: ${item.title}`)
            const fullData = await scrapeFullArticle(item.link, source, item, payload)

            let lexicalContent: any

            if (fullData && fullData.lexicalBlocks.length > 0) {
              // Nội dung đầy đủ từ trang gốc
              lexicalContent = {
                root: {
                  type: 'root',
                  children: fullData.lexicalBlocks,
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              }
            } else {
              // Fallback: dùng nội dung từ RSS
              const cleanText = (item.content || item.contentSnippet || 'Nội dung đang được cập nhật...')
                .replace(/<[^>]+>/g, ' ')
                .trim()

              lexicalContent = {
                root: {
                  type: 'root',
                  children: [
                    createParagraphNode([createTextNode(cleanText)]),
                    createParagraphNode([
                      createTextNode('Nguồn: ', 1),
                      createLinkNode(item.link, [createTextNode(item.link)]),
                    ]),
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  version: 1,
                },
              }
            }

            // Excerpt
            let excerpt = ''
            if (item.contentSnippet) {
              excerpt = item.contentSnippet.substring(0, 500)
            } else if (item.content) {
              const $rss = cheerio.load(item.content)
              excerpt = $rss.text().trim().substring(0, 500)
            }

            const searchString = `${item.title} ${excerpt} ${item.content || item.contentSnippet || ''}`
            const finalCategoryId = detectCategoryId(searchString, categoryIdMap)

            // Tạo bài viết
            await payload.create({
              collection: 'articles',
              data: {
                title: item.title,
                slug,
                excerpt: excerpt.substring(0, 500),
                content: lexicalContent,
                thumbnail: (fullData?.thumbnailId as any) || null,
                status: 'published',
                author: authorId,
                category: finalCategoryId,
                publishedAt: item.pubDate
                  ? new Date(item.pubDate).toISOString()
                  : new Date().toISOString(),
                isFeatured: false,
                seoTitle: item.title.substring(0, 70),
                seoDescription: excerpt.substring(0, 160),
              },
            })

            totalStats.created++
            console.log(`[Crawl] ✅ Tạo bài: ${item.title}`)

            // Nghỉ 2 giây giữa mỗi bài (lịch sự khi cào)
            await sleep(2000)
          } catch (err: any) {
            console.log(`[Crawl] ❌ Lỗi bài "${item.title}": ${err.message}`)
            totalStats.errors++
          }
        }

        totalStats.sources.push(source.name)
      } catch (err: any) {
        console.log(`[Crawl] ❌ Lỗi đọc RSS ${source.name}: ${err.message}`)
        totalStats.errors++
      }
    }

    const message = `Hoàn thành cào tin! Tạo mới ${totalStats.created} bài (đầy đủ nội dung + ảnh), bỏ qua ${totalStats.skipped} bài trùng, ${totalStats.errors} lỗi. Nguồn: ${totalStats.sources.join(', ')}`
    console.log(`[Crawl] 🏁 ${message}`)

    return Response.json({
      success: true,
      message,
      stats: totalStats,
    })
  } catch (error: any) {
    console.error('[Crawl] Lỗi hệ thống:', error.message)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
