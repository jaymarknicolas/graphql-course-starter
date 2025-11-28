import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./server/**/*.graphql",
  generates: {
    "./server/types/resolvers-types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "../context#Context",
        defaultMapper: "Partial<{T}>",
        scalars: {
          DateTime: "Date",
        },
        mappers: {
          Job: "@prisma/client#Job",
          JobType: "@prisma/client#JobType",
        },
      },
    },
  },
};

export default config;
