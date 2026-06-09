export {
  login,
  getTicketsByStatus,
  getTicketsByCustomerId,
  getTicket,
  getMessages,
  sendMessage,
} from './requests'

export type {
  LoginResponse,
  Ticket,
  Message,
  SendMessageResponse,
} from './types'
