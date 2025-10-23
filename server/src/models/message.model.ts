import { model, Schema } from 'mongoose';

const messageSchema = new Schema();
// fields

export const Message = model('Message', messageSchema);
