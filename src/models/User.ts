export class User {
    constructor(
      public id: number,
      public email: string,
      public username: string,
      public password: string,
      public role: string,
    ) {}

    getId() {
      return this.id;
    }
  
    getEmail() {
      return this.email;
    }
  
    getUsername() {
      return this.username;
    }
  
    getPassword() {
      return this.password;
    }

    getRole() {
      return this.role;
    }
}