import pino from 'pino';
import { config } from './env';

/**
 * Logger applicatif.
 *
 * Les champs sensibles (mots de passe, tickets Alfresco, cookies, tokens de
 * session, en-têtes d'autorisation) sont systématiquement masqués via la
 * configuration `redact` afin de garantir qu'ils n'apparaissent jamais dans les
 * journaux, même en cas de log accidentel d'un objet complet.
 */
export const logger = pino({
  level: config.logLevel,
  redact: {
    paths: [
      'password',
      'req.body.password',
      'ticket',
      'alfresco_ticket_encrypted',
      'alfrescoTicket',
      'sessionToken',
      'session_hash',
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },
  transport: config.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
});
