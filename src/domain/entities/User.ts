export class User {
    constructor(
        public id: string,
        public email: string,
        public username: string,
        public displayName: string,
        public dateOfBirth: Date,
        public password: string,
        public profileImage?: string,
        public titleImage?: string,
        public bio?: string,
        public followers: string[] = [],
        public following: string[] = [],
        public walletBalance: number = 0,
        public transactions: string[] = [],
        public createdAt?: Date,
        public updatedAt?: Date,
        public isVerified?: boolean
    ) {}
}
