import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../common/enums/user-role.enum';

export type UserDocument = User & Document;


@Schema({
    timestamps: true,
    collection: 'users',
})

export class User {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({
        type: [String],
        enum: Object.values(UserRole),
        default: [UserRole.FARMER],
    })
    roles: UserRole[];

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ required: false, index: true })
    cooperativeId?: string;

    @Prop({ required: false, select: false })
    refreshToken?: string;

    @Prop({ required: false })
    lastLoginAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes (email is unique by default, cooperativeId has index: true in @Prop)
UserSchema.index({ roles: 1 });

UserSchema.methods = {
    toJSON() {
        const obj = this.toObject();
        delete obj.password;
        delete obj.refreshToken;
        delete obj.__v;
        return obj;
    },
};
