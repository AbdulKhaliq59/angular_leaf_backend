import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserResponseDto } from './dto/user-response.dto';


@Injectable()
export class UsersService {
    private readonly bcryptSaltRounds: number;

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private configService: ConfigService,
    ) {
        this.bcryptSaltRounds = this.configService.get<number>('auth.bcryptSaltRounds', 12);
    }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { email, password, ...userData } = createUserDto;

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, this.bcryptSaltRounds);

        const newUser = new this.userModel({
            ...userData,
            email,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        return this.toResponseDto(savedUser);
    }


    async findAll(filters?: {
        role?: string;
        isActive?: boolean;
        cooperativeId?: string;
    }): Promise<UserResponseDto[]> {
        const query: any = {};

        if (filters?.role) {
            query.roles = filters.role;
        }

        if (filters?.isActive !== undefined) {
            query.isActive = filters.isActive;
        }

        if (filters?.cooperativeId) {
            query.cooperativeId = filters.cooperativeId;
        }

        const users = await this.userModel.find(query).sort({ createdAt: -1 });

        return users.map((user) => this.toResponseDto(user));
    }


    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.toResponseDto(user);
    }


    async findByEmail(email: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }


    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userModel.findOne({ email: updateUserDto.email });
            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
        }

        Object.assign(user, updateUserDto);
        const updatedUser = await user.save();

        return this.toResponseDto(updatedUser);
    }

    async remove(id: string): Promise<{ message: string }> {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }


        user.isActive = false;
        await user.save();

        return { message: 'User deactivated successfully' };
    }


    async hardDelete(id: string): Promise<{ message: string }> {
        const result = await this.userModel.findByIdAndDelete(id);

        if (!result) {
            throw new NotFoundException('User not found');
        }

        return { message: 'User permanently deleted' };
    }


    async activate(id: string): Promise<UserResponseDto> {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isActive = true;
        const updatedUser = await user.save();

        return this.toResponseDto(updatedUser);
    }

    async deactivate(id: string): Promise<UserResponseDto> {
        const user = await this.userModel.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isActive = false;
        const updatedUser = await user.save();

        return this.toResponseDto(updatedUser);
    }


    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto,
    ): Promise<{ message: string }> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.userModel.findById(userId).select('+password');

        if (!user) {
            throw new NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }
        user.password = await bcrypt.hash(newPassword, this.bcryptSaltRounds);
        await user.save();

        return { message: 'Password changed successfully' };
    }


    async getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        byRole: { [key: string]: number };
    }> {
        const [total, active, inactive, byRole] = await Promise.all([
            this.userModel.countDocuments(),
            this.userModel.countDocuments({ isActive: true }),
            this.userModel.countDocuments({ isActive: false }),
            this.userModel.aggregate([
                { $unwind: '$roles' },
                { $group: { _id: '$roles', count: { $sum: 1 } } },
            ]),
        ]);

        const roleStats = byRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        return {
            total,
            active,
            inactive,
            byRole: roleStats,
        };
    }
    private toResponseDto(user: UserDocument): UserResponseDto {
        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            roles: user.roles,
            isActive: user.isActive,
            cooperativeId: user.cooperativeId,
            lastLoginAt: user.lastLoginAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
