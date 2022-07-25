import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {ReturnedUsersValuesInterfaces, Status, SuccessfullyUpdatedUsersInterfaces, UserFilterInterface} from "../types";
import {UserUpdateDto} from './dto/user.update.dto';
import fetch from 'node-fetch';
import {Response} from 'express';
import {User} from "../schemas/user.schema";


@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {
    }

    //PAGINATION
    async getAllActiveUsers(itemsOnPage: number, page: number): Promise<ReturnedUsersValuesInterfaces> {
        const maxItemsOnPage = itemsOnPage;
        const currentPage = page;
        const countElement = await this.userModel.count({status: Status.ACTIVE, active: true});
        const getAllActiveUsers = await this.userModel.find({
            status: Status.ACTIVE,
            active: true
        }).skip(maxItemsOnPage * (currentPage - 1)).limit(maxItemsOnPage).exec();


        const totalPages = Math.round(countElement / maxItemsOnPage);


        return {
            users: getAllActiveUsers,
            pages: totalPages
        }
    }

    //TYLKO USER ROLA USER useGuard()
    async userFoundJob(id: string) {
        const user = this.userModel.findByIdAndUpdate({_id: id}, {$set: {status: Status.HIRED}});

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND)
        }

        return {
            updated: true
        }
    }

    //Update
    async updateUserAfterLogin(id: string, {
        bio,
        education,
        email,
        expectedContractType,
        expectedSalary,
        expectedTypeWork,
        firstname,
        githubUsername,
        lastname,
        monthsOfCommercialExp,
        targetWorkCity,
        tel,
        courses,
        workExperience,
        canTakeApprenticeship,
        projectUrls,
        portfolioUrls,
        avatarUrl
    }: UserUpdateDto): Promise<SuccessfullyUpdatedUsersInterfaces> {
        const findUser = await this.userModel.findOne({_id: id});
        const getAllUsers = await this.userModel.find().exec();

        //CHECK IF EMAIL is already set in DB
        for (const user of getAllUsers) {
            if (user.email === email) {
                throw new HttpException(`User already exists with that email. (${email})`, HttpStatus.BAD_REQUEST);
            }
        }

        //check GITHUB USERNAME
        const res = await fetch(`https://api.github.com/users/${githubUsername}`);
        if (res.status === 404) {
            throw new HttpException(`Github username not exist. Check again username: (${githubUsername})`, HttpStatus.NOT_FOUND);
        }
        if (res.status === 200) {
            avatarUrl = `https://github.com/${githubUsername}.png`
        }
        //check values
        if (email === '' || tel === 0 || portfolioUrls.length === 0 || targetWorkCity === '' || expectedSalary === '') {
            email = findUser.email;
            tel = 0;
            portfolioUrls = [];
            targetWorkCity = '';
            expectedSalary = 0;
        }

        if (monthsOfCommercialExp < 0) {
            throw new HttpException('Not allowed to set negative values', HttpStatus.BAD_REQUEST);
        }

        if ((!email.includes('@')) || email.length <= 5) {
            throw new HttpException(`Email should contain @. Got (${email}), and have at least 5 characters.`, HttpStatus.BAD_REQUEST);
        }

        if (firstname === '' && lastname === '' && projectUrls.length === 0) {
            throw new HttpException(`${firstname} / ${lastname} / ${projectUrls} cannot be empty`, HttpStatus.BAD_REQUEST);
        }

        //UPDATE USER
        await this.userModel.findByIdAndUpdate({_id: id}, {
            $set: {
                firstName: firstname,
                lastName: lastname,
                tel,
                email,
                githubUsername,
                bio,
                expectedTypeWork,
                targetWorkCity,
                expectedContractType,
                expectedSalary,
                monthsOfCommercialExp,
                canTakeApprenticeship,
                education,
                courses,
                workExperience,
                portfolioUrls,
                projectUrls,
                avatarUrl
            }
        });

        return {
            success: true,
            text: `User with id (${id}) updated`
        }
    }


    //AVATAR URL SCHEMA CREATE!
    async getSingleUserCV(id: string, res: Response) {
        try {
            const user = await this.userModel.findOne({_id: id});
            res.json({
                user
            })
        } catch (e) {
            if (e) {
                res.json({
                    message: 'Incorrect id',
                    defaultMessage: e.message
                })
            }
            console.error(e)
        }

    }

    //filter data ERROR WITH OD DO SALARY
    async filterUsers(query: UserFilterInterface) {
        const all = await this.userModel.find().exec();

        return all.filter(user => {
            let isValid = true;
            for (const key in query) {
                isValid = isValid && user[key] == query[key];
            }
            return isValid;
        });
    }
}
