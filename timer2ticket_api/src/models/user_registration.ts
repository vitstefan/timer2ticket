export class UserRegistration {
  username: string;
  password: string;
  passwordAgain: string;

  constructor(username: string, password: string, passwordAgain: string) {
    this.username = username;
    this.password = password;
    this.passwordAgain = passwordAgain;
  }
}