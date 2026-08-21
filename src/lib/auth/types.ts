export type Session = {
  userId: string;
  email: string;
  username: string;
  name: string;
  roles: string[];
};

export type SessionRecord = Session & {
  idToken: string;
};
