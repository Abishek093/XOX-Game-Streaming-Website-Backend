export interface UserProps {
    id?: string;
    email: string;
    username: string;
    displayName?: string;
    password: string;
    profileImage?: string;
    titleImage?: string;
    bio?: string;
    // followers?: string[];
    // following?: string[];
    walletBalance?: number;
    transactions?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    isVerified?: boolean;
    isGoogleUser?: boolean;
    dateOfBirth?: Date;
    isBlocked?: boolean;
}

export class User {
    public id: string;
    public email: string;
    public username: string;
    public displayName?: string;
    public password: string;
    public profileImage?: string;
    public titleImage?: string;
    public bio?: string;
    // public followers: string[];
    // public following: string[];
    public walletBalance: number;
    public transactions: string[];
    public createdAt: Date;
    public updatedAt: Date;
    public isVerified: boolean;
    public isGoogleUser: boolean;
    public dateOfBirth?: Date;
    public isBlocked: boolean;

    constructor(props: UserProps) {
        this.id = props.id ?? '';
        this.email = props.email;
        this.username = props.username;
        this.displayName = props.displayName;
        this.password = props.password;
        this.profileImage = props.profileImage ?? '';
        this.titleImage = props.titleImage;
        this.bio = props.bio;
        // this.followers = props.followers ?? [];
        // this.following = props.following ?? [];
        this.walletBalance = props.walletBalance ?? 0;
        this.transactions = props.transactions ?? [];
        this.createdAt = props.createdAt ?? new Date();
        this.updatedAt = props.updatedAt ?? new Date();
        this.isVerified = props.isVerified ?? false;
        this.isGoogleUser = props.isGoogleUser ?? false;
        this.dateOfBirth = props.dateOfBirth;
        this.isBlocked = props.isBlocked ?? false;
    }
}

export type AuthenticatedUser = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        username: string;
        displayName?: string;
        email: string;
        profileImage?: string;
        titleImage?: string;
        bio?: string;
        // followers: string[];
        // following: string[];
    };
};

export type NonSensitiveUserProps = {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    profileImage?: string;
    titleImage?: string;
    bio?: string;
    dateOfBirth?: Date;
}
