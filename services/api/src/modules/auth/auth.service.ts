import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
    signup(): string {
        return "Signup succeful";
    }

    signupConfirm(): string {
        return "Signup confirm succeful";
    }

    login(): string {
        return "Login succeful";
    }

    logout(): string {
        return "Logout succeful";
    }

    resetPassword(): string {
        return "Password reset succeful";
    }
}
