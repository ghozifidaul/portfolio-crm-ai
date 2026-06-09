export { findByUsername, findById, createUser } from "./users";
export {
  createTicket,
  updateTicket,
  getTicketById,
  getTicketsByCustomer,
  getOpenTickets,
  getAllTickets,
  resolveTicket,
} from "./tickets";
export { addMessage, getConversationHistory, getMessagesByTicket } from "./messages";
export type {
  DbUser,
  DbTicket,
  DbMessage,
  AITicket,
  ConversationEntry,
} from "./schema";
