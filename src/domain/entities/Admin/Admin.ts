export interface AdminProps {
    id?: string;
    email: string;
    name: string;
    password: string;
}

export class Admin {
    public id: string;
    public email: string;
    public name: string;
    public displayName?: string;
    public password: string;


    constructor(props: AdminProps) {
        this.id = props.id ?? '';
        this.email = props.email;
        this.name = props.name;
        this.password = props.password;

    }
}

export type AuthenticatedAdmin = {
    accessToken: string;
    refreshToken: string;
    admin: {
        id: string;
        name: string;
        email: string;
    };
};
