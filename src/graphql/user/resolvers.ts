const queries = {};

const mutations = {
  createUser: async (_: any, {}, {}) => {
    return "random string";
  },
};

export const resolvers = { queries, mutations };
