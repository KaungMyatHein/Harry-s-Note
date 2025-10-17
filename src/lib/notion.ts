import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export interface BookSummary {
  id: string
  title: string
  author: string
  summary: string
  rating: number | null
  length: number | null
  coverImage: string | null
  tags: string[]
  createdAt: string
}

// Helper function to extract detailed content from a Notion page
async function extractPageContent(pageId: string): Promise<string> {
  try {
    const pageContent = await notion.blocks.children.list({
      block_id: pageId,
    })
    
    // Extract text content from blocks
    let detailedContent = ''
    for (const block of pageContent.results) {
      const blockObj = block as any // Type assertion to handle Notion API types
      if (blockObj.type === 'paragraph' && blockObj.paragraph) {
        const text = blockObj.paragraph.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        if (text.trim()) {
          detailedContent += text + '\n\n'
        }
      } else if (blockObj.type === 'heading_1' && blockObj.heading_1) {
        const text = blockObj.heading_1.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        if (text.trim()) {
          detailedContent += '# ' + text + '\n\n'
        }
      } else if (blockObj.type === 'heading_2' && blockObj.heading_2) {
        const text = blockObj.heading_2.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        if (text.trim()) {
          detailedContent += '## ' + text + '\n\n'
        }
      } else if (blockObj.type === 'heading_3' && blockObj.heading_3) {
        const text = blockObj.heading_3.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        if (text.trim()) {
          detailedContent += '### ' + text + '\n\n'
        }
      } else if (blockObj.type === 'bulleted_list_item' && blockObj.bulleted_list_item) {
        const text = blockObj.bulleted_list_item.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        if (text.trim()) {
          detailedContent += '- ' + text + '\n'
        }
      } else if (blockObj.type === 'numbered_list_item' && blockObj.numbered_list_item) {
        const text = blockObj.numbered_list_item.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        if (text.trim()) {
          detailedContent += '1. ' + text + '\n'
        }
      } else if (blockObj.type === 'quote' && blockObj.quote) {
        const text = blockObj.quote.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        if (text.trim()) {
          detailedContent += '> ' + text + '\n\n'
        }
      } else if (blockObj.type === 'callout' && blockObj.callout) {
        const text = blockObj.callout.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        const icon = blockObj.callout.icon?.emoji || '💡'
        if (text.trim()) {
          detailedContent += `> ${icon} ${text}\n\n`
        }
      } else if (blockObj.type === 'toggle' && blockObj.toggle) {
        const text = blockObj.toggle.rich_text
          .map((t: any) => t.plain_text)
          .join('')
        if (text.trim()) {
          detailedContent += text + '\n\n'
        }
      } else if (blockObj.type === 'image' && blockObj.image) {
        // Handle image blocks
        let imageUrl = ''
        let altText = 'Image'
        
        if (blockObj.image.type === 'external' && blockObj.image.external?.url) {
          imageUrl = blockObj.image.external.url
        } else if (blockObj.image.type === 'file' && blockObj.image.file?.url) {
          imageUrl = blockObj.image.file.url
        }
        
        // Get caption if available
        if (blockObj.image.caption && blockObj.image.caption.length > 0) {
          altText = blockObj.image.caption
            .map((t: any) => t.plain_text)
            .join('')
        }
        
        if (imageUrl) {
          detailedContent += `![${altText}](${imageUrl})\n\n`
        }
      }
    }
    
    return detailedContent.trim()
  } catch (error) {
    console.error('Error extracting page content:', error)
    return ''
  }
}

export async function getBookSummaries(): Promise<BookSummary[]> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID
    
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID is not configured')
    }

    console.log('Attempting to query Notion database:', databaseId)

    // First, let's get the database schema to see what properties are available
    const database = await notion.databases.retrieve({ database_id: databaseId })
    console.log('Database properties:', Object.keys(database.properties))

    // Query without sorting first to avoid property errors
    const response = await notion.databases.query({
      database_id: databaseId,
    })

    console.log('Notion API response:', JSON.stringify(response, null, 2))
    console.log('Number of results:', response.results.length)

    // Process each book and fetch detailed content
    const books: BookSummary[] = await Promise.all(
      response.results.map(async (page: any) => {
        const properties = page.properties
        console.log('Page properties:', JSON.stringify(properties, null, 2))
        
        // Get basic summary from properties
        const basicSummary = properties.Summary?.rich_text?.[0]?.plain_text || 
                            properties.summary?.rich_text?.[0]?.plain_text ||
                            properties.Description?.rich_text?.[0]?.plain_text ||
                            'No summary available'
        
        // Fetch detailed page content
        const detailedContent = await extractPageContent(page.id)
        
        // Use detailed content if available, otherwise fall back to basic summary
        const finalSummary = detailedContent || basicSummary
        
        return {
          id: page.id,
          title: properties.Title?.title?.[0]?.plain_text || 
                 properties.Name?.title?.[0]?.plain_text || 
                 'Untitled',
          author: properties.Author?.rich_text?.[0]?.plain_text || 
                  properties.author?.rich_text?.[0]?.plain_text ||
                  'Unknown Author',
          summary: finalSummary,
          rating: properties.Rating?.number || null,
          length: properties.Length?.number || null,
          coverImage: properties.Cover?.files?.[0]?.file?.url || 
                     properties['Cover Image']?.files?.[0]?.file?.url ||
                     null,
          tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || 
                properties.tags?.multi_select?.map((tag: any) => tag.name) ||
                properties.Genre?.multi_select?.map((tag: any) => tag.name) ||
                [],
          createdAt: properties.Created?.created_time || 
                     properties.created?.created_time ||
                     page.created_time,
        }
      })
    )

    return books
  } catch (error) {
    console.error('Error fetching book summaries from Notion:', error)
    throw new Error('Failed to fetch book summaries')
  }
}

export async function getRandomBookSummary(): Promise<BookSummary | null> {
  try {
    const books = await getBookSummaries()
    if (books.length === 0) return null
    
    const randomIndex = Math.floor(Math.random() * books.length)
    return books[randomIndex]
  } catch (error) {
    console.error('Error getting random book summary:', error)
    return null
  }
}

export async function getBookById(id: string): Promise<BookSummary | null> {
  try {
    const books = await getBookSummaries()
    const book = books.find(book => book.id === id)
    
    if (!book) return null
    
    // The book already has detailed content from getBookSummaries, so we can return it directly
    return book
  } catch (error) {
    console.error('Error getting book by ID:', error)
    return null
  }
}