import mongoose, { Document, Schema } from 'mongoose'

export interface Ichat extends Document{
    users: string[];
    latestMessage: {
        text: string;
        sender: string
    }

    createdAt: Date;
    updatedAr: Date;
}

const schema: Schema<Ichat> = new Schema({
    users: [{type: String, require: true}],
    latestMessage:{
        text:String,
        sender:String
    }
  },
  {
    timestamps: true
  }
)

export const Chat = mongoose.model<Ichat>("Chat", schema)