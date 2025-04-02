const authDocs = {
  '/admin-auth/sign-in': {
    post: {
      summary: "Connexion de l'administrateur",
      tags: ['Admin Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AdminSignInRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Connexion réussie',
        },
        401: {
          description: "Échec de l'autorisation",
        },
        422: {
          description: 'Erreur de validation',
        },
        500: {
          description: 'Erreur serveur inconnue',
        },
      },
    },
  },
  '/admin-auth/refresh': {
    post: {
      summary: 'Rafraîchir le jeton',
      tags: ['Admin Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AdminRefreshTokenRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Jeton rafraîchi avec succès',
        },
        401: {
          description: "Échec de l'autorisation",
        },
      },
    },
  },
  '/admin-auth/sign-out': {
    delete: {
      summary: 'Déconnexion',
      tags: ['Admin Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AdminSignOutRequest',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Déconnexion réussie',
        },
      },
    },
  },
};

const authSchemas = {
  AdminSignInRequest: {
    type: 'object',
    properties: {
      username: { type: 'string', example: 'Birewa' },
      password: { type: 'string', example: 'secret' },
    },
    required: ['username', 'password'],
  },
  AdminRefreshTokenRequest: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...',
      },
    },
    required: ['token'],
  },
  AdminSignOutRequest: {
    type: 'object',
    properties: {
      token: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...',
      },
    },
    required: ['token'],
  },
};

export default authDocs;
export { authSchemas };
