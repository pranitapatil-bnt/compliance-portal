"use client";

import { useActionState } from "react";

import { loginAction, type LoginState } from "../actions/login";

const initialState: LoginState = { error: null };

export function useLogin() {
  return useActionState(loginAction, initialState);
}
