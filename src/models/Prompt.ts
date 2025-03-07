import { Schema, model, Document } from 'mongoose';

interface IPrompt extends Document {
  promptQuestion: string;
  resp1: string;
  resp2: string;
  resp3: string;
  resp4: string;
}

const PromptSchema = new Schema<IPrompt>({
  promptQuestion: {
    type: String,
    default: ''
  },
  resp1: {
    type: String,
    default: ''
  },
  resp2: {
    type: String,
    default: ''
  },
  resp3: {
    type: String,
    default: ''
  },
  resp4: {
    type: String,
    default: ''
  }
});

export default model<IPrompt>('Prompt', PromptSchema);
