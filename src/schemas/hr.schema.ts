import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class HumanResources {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  lastName: string;

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  company: string;

  @Prop({
    type: Number,
    min: 1,
    max: 999,
  })
  maxReservedStudents: number;

  @Prop({
    type: String,
    default: null,
    required: true,
  })
  password: string;
}

export const HrSchema = SchemaFactory.createForClass(HumanResources);
