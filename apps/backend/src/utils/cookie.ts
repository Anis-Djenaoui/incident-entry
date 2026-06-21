import { CookieOptions, Response } from 'express';
import { config } from '../config/env';

const HOUR_IN_MS = 60 * 60 * 1000;

const baseCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.session.cookieSecure,
  sameSite: 'strict',
  path: '/',
});

export const setSessionCookie = (res: Response, token: string): void => {
  res.cookie(config.session.cookieName, token, {
    ...baseCookieOptions(),
    maxAge: config.session.durationHours * HOUR_IN_MS,
  });
};

export const clearSessionCookie = (res: Response): void => {
  res.clearCookie(config.session.cookieName, baseCookieOptions());
};
