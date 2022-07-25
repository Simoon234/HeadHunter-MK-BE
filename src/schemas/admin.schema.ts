import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';


export type AdminDocument = Admin & Document;

export interface AdminInterface {
    email: string;
    password: string;
}

@Schema()
export class Admin implements AdminInterface {
    @Prop({type: String, required: true})
    email: string;

    @Prop({type: String, required: true})
    password: string;

    @Prop({type: String})
    token: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);