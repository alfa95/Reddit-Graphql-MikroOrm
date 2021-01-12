import { UserRegister } from "../resolvers/UserRegister";

export const validateRegister = (input: UserRegister) => {
    if (!input.email.includes("@")) {
        return  [
            {
              field: "email",
              message: "Invalid Email",
            },
          ];
      }
  
      if (input.username.length <= 2) {
        return [
            {
              field: "username",
              message: "UserName Length Should be greater than 2",
            },
          ];
      }

      if (input.username.includes('@')) {
        return [
            {
              field: "username",
              message: "cannot include @",
            },
          ];
      }
  
      if (input.password.length <= 3) {
        return  [
            {
              field: "password",
              message: "Password Length Should be greater than 3",
            },
          ];
      }

      return null;
} 