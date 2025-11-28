const resolvers = {
  Query: {
    me: () => {
      return {
        id: "1",
      };
    },
  },
};

export default resolvers;
