import { Resolvers, UserRole } from "../../types/resolvers-types";

const resolvers = {
  User: {
    appliedJobs: async (user: any, args: any, context: any) => {
      return context.prisma.job.findMany({
        where: { applicants: { some: { id: user.id } } },
      });
    },
    ownedJobs: async (user: any, args: any, context: any) => {
      if (!context.auth.user?.isAdmin) return [];

      return context.prisma.job.findMany({
        where: { ownId: user.id },
      });
    },
  },
  Query: {
    me: async (root: any, args: any, context: any) => {
      if (!context.auth.user) return null;

      const user = await context.prisma.user.findUnique({
        where: { id: context.auth.user.id },
      });

      if (!user) return null;

      return {
        ...user,
        role: user.role as UserRole,
      };
    },
  },
  Mutation: {
    signup: async (root: any, args: any, context: any) => {
      const { email, name, role, password } = args.input;

      const user = await context.prisma.user.create({
        data: {
          email,
          name,
          role,
          password,
        },
      });

      if (!user) throw new Error("Invalid email or password");

      if (user.password !== password)
        throw new Error("Invalid email or password");

      context.auth.login({
        id: user.id,
        isAdmin: user.role === UserRole.Admin,
      });

      return {
        ...user,
        role: user.role as UserRole,
      };
    },
    logout: async (root: any, args: any, context: any) => {
      context.auth.logout();
    },
    login: async (root: any, args: any, context: any) => {
      const { email, password } = args.input;

      const user = await context.prisma.user.findUnique({
        where: { email },
      });

      if (!user) throw new Error("Invalid email or password");

      if (user.password !== password)
        throw new Error("Invalid email or password");

      context.auth.login({
        id: user.id,
        isAdmin: user.role === UserRole.Admin,
      });

      return {
        ...user,
        role: user.role as UserRole,
      };
    },
  },
};

export default resolvers;
