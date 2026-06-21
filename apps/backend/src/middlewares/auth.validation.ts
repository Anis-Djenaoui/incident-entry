import { body } from 'express-validator';

export const loginValidation = [
  body('username')
    .exists({ checkNull: true })
    .withMessage("Le nom d'utilisateur est obligatoire")
    .bail()
    .isString()
    .withMessage("Le nom d'utilisateur est invalide")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Le nom d'utilisateur est obligatoire")
    .isLength({ max: 100 })
    .withMessage("Le nom d'utilisateur ne doit pas dépasser 100 caractères"),

  body('password')
    .exists({ checkNull: true })
    .withMessage('Le mot de passe est obligatoire')
    .bail()
    .isString()
    .withMessage('Le mot de passe est invalide')
    .bail()
    .notEmpty()
    .withMessage('Le mot de passe est obligatoire')
    .isLength({ max: 200 })
    .withMessage('Le mot de passe ne doit pas dépasser 200 caractères'),
];
