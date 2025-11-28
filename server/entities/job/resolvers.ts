const resolvers = {
  Job: {
    company: async (job: any, args: any, context: any) => {
      const company = await context.prisma.job.findUnique({
        where: {
          id: job.companyId,
        },
      });

      if (!company) throw new Error("Company not found");

      return company;
    },
    isApplied: async (job: any, args: any, context: any) => {
      const isApplied = await context.prisma.job.count({
        where: {
          id: job.id,
          applicants: { some: { id: context.auth.user?.id } },
        },
      });

      return isApplied > 0;
    },
  },
  Query: {
    searchJobs: async (root: any, args: any, context: any) => {
      const { query } = args.input;

      const jobs = await context.prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { location: { contains: query } },
          ],
        },
      });

      return jobs;
    },
  },
  Mutation: {
    createJob: async (root: any, args: any, context: any) => {
      if (!context.auth.user?.isAdmin) throw new Error("Unauthorized");
      const {
        location,
        title,
        description,
        type,
        remote,
        salary,
        companyName,
      } = args.input;

      const job = await context.prisma.job.create({
        data: {
          location,
          title,
          description,
          type,
          remote,
          salary,
          company: {
            create: {
              name: companyName,
            },
          },
          owner: {
            connect: {
              id: context.auth.user.id,
            },
          },
        },
      });

      return job;
    },
    deleteJob: async (root: any, args: any, context: any) => {
      if (!context.auth.user?.isAdmin) throw new Error("Unauthorized");

      await context.prisma.job.delete({
        where: { id: args.input.id, ownerId: context.auth.user.id },
      });

      return true;
    },
    applyForJob: async (root: any, args: any, context: any) => {
      if (!context.auth.user?.isAdmin) throw new Error("Unauthorized");

      await context.prisma.job.update({
        where: { id: args.input.id },
        data: {
          applicants: {
            connect: {
              id: context.auth.user.id,
            },
          },
        },
      });

      return true;
    },
    cancelJobApplication: async (root: any, args: any, context: any) => {
      if (!context.auth.user?.isAdmin) throw new Error("Unauthorized");

      await context.prisma.job.update({
        where: { id: args.input.id },
        data: {
          applicants: {
            disconnect: {
              id: context.auth.user.id,
            },
          },
        },
      });

      return true;
    },
  },
};

export default resolvers;
