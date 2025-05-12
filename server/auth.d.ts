declare module "#auth-utils" {
  interface User {
    id: number;
    name: string;
    country: string;
    sex: string;
    weight: number;
    avatar: string;
  }

  interface UserSession {
    user: {
      id: number;
      name: string;
      country: string;
      sex: string;
      weight: number;
      avatar: string;
    };
  }

  interface SecureSessionData {
    // Add your own fields
  }
}
