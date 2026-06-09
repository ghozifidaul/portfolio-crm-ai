import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, jwt } from 'hono/jwt'
import { findByUsername, getTicketsByCustomer, getAllTickets, getTicketById, getMessagesByTicket, getConversationHistory, getConversations } from './db'
import { processMessage } from './message-router'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

const app = new Hono()

app.use('/api/*', cors())
const authenticate = jwt({ secret: JWT_SECRET, alg: 'HS256' })

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/api/login', async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) {
    return c.json({ error: 'Username and password are required' }, 400)
  }

  const user = await findByUsername(username)
  if (!user) {
    return c.json({ error: 'Invalid username or password' }, 401)
  }

  const valid = await Bun.password.verify(password, user.password)
  if (!valid) {
    return c.json({ error: 'Invalid username or password' }, 401)
  }

  const payload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }

  const token = await sign(payload, JWT_SECRET)

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  })
})

app.post('/api/messages', authenticate, async (c) => {
  const { customer_id, content, sender } = await c.req.json()

  if (!customer_id || !content || !sender) {
    return c.json({ error: 'customer_id, content, and sender are required' }, 400)
  }

  if (sender !== 'customer' && sender !== 'agent') {
    return c.json({ error: 'sender must be "customer" or "agent"' }, 400)
  }

  try {
    const result = await processMessage(customer_id, content, sender)
    return c.json(result)
  } catch (err: any) {
    const status = err.status || 500
    return c.json({ error: err.message }, status)
  }
})

app.get('/api/messages', authenticate, async (c) => {
  const customerId = c.req.query('customer_id')
  const limit = parseInt(c.req.query('limit') || '50', 10)

  if (!customerId) {
    return c.json({ error: 'customer_id query parameter is required' }, 400)
  }

  const messages = await getConversationHistory(customerId, limit)
  return c.json(messages)
})

app.get('/api/tickets', authenticate, async (c) => {
  const customerId = c.req.query('customer_id')
  const status = c.req.query('status')

  const tickets = customerId
    ? await getTicketsByCustomer(customerId, status)
    : await getAllTickets(status)

  return c.json(tickets)
})

app.get('/api/conversations', authenticate, async (c) => {
  const payload = c.get('jwtPayload') as { role?: string }
  if (payload.role !== 'agent') {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const conversations = await getConversations()
  return c.json(conversations)
})

app.get('/api/tickets/:id', authenticate, async (c) => {
  const ticketId = c.req.param('id')
  const ticket = await getTicketById(ticketId)

  if (!ticket) {
    return c.json({ error: 'Ticket not found' }, 404)
  }

  const messages = await getMessagesByTicket(ticketId)
  return c.json({ ...ticket, messages })
})

export default app
