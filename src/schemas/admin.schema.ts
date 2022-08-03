import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { Role } from "src/types";

export type AdminDocument = Admin & Document;

export interface AdminInterface {
  email: string;
  password: string;
}

@Schema()
export class Admin implements AdminInterface {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, default: null, nullable: true })
  accessToken: string;

  @Prop({
    type: String,
    enum: Role,
    default: Role.ADMIN,
  })
  role: Role.ADMIN
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
