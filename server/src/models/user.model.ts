import { model, Schema } from 'mongoose';

const userSchema = new Schema();
// fields

export const User = model('User', userSchema);
