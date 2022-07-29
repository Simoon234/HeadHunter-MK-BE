import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { User } from "./user.schema";
import mongoose from "mongoose";


@Schema()
export class HumanResources {
    @Prop({
        type: String,
        required: true
    })
    name: string;

    @Prop({
        type: String,
        required: true
    })
    lastName: string;

    @Prop({
        type: String,
        unique: true,
        required: true
    })
    email: string;

    @Prop({
        type: String,
        required: true
    })
    company: string;

    @Prop({
        type: Number,
        min: 1,
        max: 999
    })
    maxReservedStudents: number;

    @Prop({
        type: String,
        default: null
    })
    password: string;

    @Prop({
        type: Boolean,
        default: false
    })
    active: boolean;

    @Prop({
        type: String,
        default: null,
        nullable: true
    })

    registerToken: string;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: "User" }])
    users: User[];
}

export const HrSchema = SchemaFactory.createForClass(HumanResources);